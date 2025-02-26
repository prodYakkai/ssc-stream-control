/*
 * File: batch.ts
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

import { MasterSheetShareList } from './../constants/index';
import { Router, Request, Response } from 'express';
import {  prisma, serviceAccountGAuth } from '..';
import { GoogleSpreadsheet,  } from 'google-spreadsheet';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { generateStreamUrl, getUrlSignHash } from '../utils/urlConstruct';
import unsnakeCase from '../utils/unsnake';
import randomRgbColor from '../utils/randomColor';
import { logAuditTrail } from '../services/AuditTrailService';
import { AuditTrailAction } from '@prisma/client';
dayjs.extend(localizedFormat)

const batchRouter = Router();

let genLock = false;

batchRouter.post('/master_report', async(req: Request,res: Response)=>{
    const { 
        previewSignValidHours,
        eventId
    } = req.body;

    try{
        if (genLock) {
            res.status(400).send({
                code: 1,
                message: 'Generation is locked, please try again later.'
            });
            return;
        }

        if (previewSignValidHours <= 0) {
            res.status(400).send({
                code: 1,
                message: 'Invalid request body, previewSignValidHours must be greater than 1'
            });
            return;
        }

        logAuditTrail({
            action: AuditTrailAction.GenerateMasterSheet,
            // @ts-expect-error this is fine
            actor: req.user.email,
            target: 'all',
        })

        genLock = true;

        const allVhostDocs = await prisma.category.findMany({
            where: {
                eventId
            },
            include: {
                streams: true,
            }
        });

        const masterDoc = await GoogleSpreadsheet.createNewSpreadsheetDocument(serviceAccountGAuth, 
            { 
                title: `Stream Master Sheet - Generated On ${dayjs().format('llll')}`,
                locale: 'en_US' 
            }
        );
        await masterDoc.loadInfo();

        for(const shareContact of MasterSheetShareList){
            await masterDoc.share(shareContact.email, {
                isGroup: shareContact.isGroup,
                // @ts-expect-error this is fine
                role: shareContact.role,
                emailMessage: false
            });
        }
        
        res.send({
            code: 0,
            message: 'Generated Master Sheet Successfully!',
            data: {
                url: `https://docs.google.com/spreadsheets/d/${masterDoc.spreadsheetId}`,
                sharedList: MasterSheetShareList
            }
        });
        
        const metaSheet = masterDoc.sheetsByIndex[0];
        await metaSheet.updateProperties({
            title: 'Meta',
            tabColor: {
                red: 92 / 255,
                green: 227 / 255,
                blue: 201 / 255,
            },
            gridProperties: {
                columnCount: 1,
                rowCount: 7 + allVhostDocs.length,
                hideGridlines: true,
            }
        });
        await metaSheet.setHeaderRow(['Welcome to the Stream Master Sheet']);
        await metaSheet.addRows([
            ['Status: GENERATING, INCOMPLETE DATA'],
            [`Generated on ${dayjs().format('LLLL')}, Preview Sign Validity: ${previewSignValidHours} hours.`],
            ['This sheet contains all the stream keys and their details.'],
            ['If you need modification, please "Make a Copy" and then make changes.'],
            ['---------------------------------'],
            ['Vhost included in this generation:']
        ]);

        await metaSheet.updateDimensionProperties('COLUMNS',
        {
            pixelSize: 600,
            hiddenByFilter: false,
            hiddenByUser: false,
            developerMetadata: [],
        },
        {
            startIndex: 0,
            endIndex: 1
        });

        await metaSheet.loadCells();
        const headerCell = metaSheet.getCell(0,0);
        headerCell.textFormat = {
            fontSize: 20,
            bold: true,
            foregroundColor: {
                red: 0.1,
                green: 0.1,
                blue: 0.1
            }
        }
        const statusCell = metaSheet.getCell(1,0);
        statusCell.backgroundColor = {
            red: 1,
            green: 0,
            blue: 0
        }
        statusCell.horizontalAlignment = 'CENTER';
        statusCell.verticalAlignment = 'MIDDLE';
        statusCell.textFormat = {
            fontSize: 20,
            bold: true,
            foregroundColor: {
                red: 0.1,
                green: 0.1,
                blue: 0.1
            }
        }
        await headerCell.save();
        await statusCell.save();
        await metaSheet.saveUpdatedCells();

        const rollCallSheet = await masterDoc.addSheet({
            title: 'Roll Call',
            gridProperties: {
                frozenRowCount: 1,
                frozenColumnCount: 1,
                columnCount: 9,
                rowCount: 1 + allVhostDocs.reduce((acc, vhost) => acc + vhost.streams.length, 0)
            },
            tabColor: {
                red: 1,
                green: 0,
                blue: 0
            }
        });

        await rollCallSheet.setHeaderRow(
            [
                'Vhost',
                'Room Name',
                'Stream Name',
                'Publish Key',
                'RTMP Ingest URL',
                'WHIP Ingest URL',
                'Web Preview URL',
                'RTMP Preview URL',
                'Memo'
            ]
        );

        rollCallSheet.updateDimensionProperties('COLUMNS',
        {
            pixelSize: 150,
            hiddenByFilter: false,
            hiddenByUser: false,
            developerMetadata: [],
        },
        {
            startIndex: 0,
            endIndex: 3
        });

        rollCallSheet.updateDimensionProperties('COLUMNS',
        {
            pixelSize: 300,
            hiddenByFilter: false,
            hiddenByUser: false,
            developerMetadata: [],
        },
        {
            startIndex: 3,
            endIndex: 8
        });


        for( const vhostDoc of allVhostDocs)
        {
            const vhostSheet = await masterDoc.addSheet({
                title: unsnakeCase(vhostDoc.name),
                gridProperties: {
                    frozenRowCount: 1,
                    frozenColumnCount: 1,
                    columnCount: 9,
                    rowCount: vhostDoc.streams.length + 1
                },
                tabColor: randomRgbColor()
            });
            await vhostSheet.setHeaderRow(
                [
                    'ID',
                    'Stream Name',
                    'Publish Key',
                    'RTMP Ingest URL',
                    'WHIP Ingest URL',
                    'Web Preview URL',
                    'RTMP Preview URL',
                    'Generated On'
                ]
            )
            const vhostEntriesRow  = [], rollCallEntriesRow = [];
            for(const vhostEntry of vhostDoc.streams)
            {
                vhostEntriesRow.push([
                    vhostEntry.id,
                    vhostEntry.name,
                    vhostEntry.ingestKey,
                    generateStreamUrl('rtmp', {
                        category: vhostDoc.name,
                        name:  vhostEntry.name,
                        key: vhostEntry.ingestKey,
                        publish: true,
                    }),
                    generateStreamUrl('whip', {
                        category: vhostDoc.name,
                        name:  vhostEntry.name,
                        key: vhostEntry.ingestKey,
                        publish: true,
                    }),
                    generateStreamUrl('web', {
                        category: vhostDoc.name,
                        name:  vhostEntry.name,
                        key: vhostEntry.viewKey,
                    }),
                    generateStreamUrl('rtmp', {
                        category: vhostDoc.name,
                        name:  vhostEntry.name,
                        key: vhostEntry.viewKey,
                        playbackParams: getUrlSignHash(vhostEntry, previewSignValidHours)
                    }),
                    dayjs(vhostEntry.updatedAt).format('llll')
                ]);
                rollCallEntriesRow.push([
                    vhostEntry.name,
                    vhostEntry.name,
                    vhostEntry.ingestKey,
                    generateStreamUrl('rtmp', {
                        category: vhostDoc.name,
                        name:  vhostEntry.name,
                        key: vhostEntry.ingestKey,
                        publish: true,
                    }),
                    generateStreamUrl('whip', {
                        category: vhostDoc.name,
                        name:  vhostEntry.name,
                        key: vhostEntry.ingestKey,
                        publish: true,
                    }),
                    generateStreamUrl('web', {
                        category: vhostDoc.name,
                        name:  vhostEntry.name,
                        key: vhostEntry.viewKey,
                    }),
                    generateStreamUrl('rtmp', {
                        category: vhostDoc.name,
                        name:  vhostEntry.name,
                        key: vhostEntry.viewKey,
                        playbackParams: getUrlSignHash(vhostEntry, previewSignValidHours)
                    }),
                    vhostEntry.description || ''
                ]);
            }
            vhostSheet.addRows(vhostEntriesRow, {
                raw: true
            });
            vhostSheet.updateDimensionProperties('COLUMNS',
            {
                pixelSize: 200,
                hiddenByFilter: false,
                hiddenByUser: false,
                developerMetadata: [],
            },
            {
                startIndex: 4,
                endIndex: 10
            });
            await metaSheet.addRow([unsnakeCase(vhostDoc.name)]);
            await rollCallSheet.addRows(rollCallEntriesRow, {
                raw: true
            });
        }

        await metaSheet.loadCells();
        const statusCellComplete = metaSheet.getCell(1,0);
        statusCellComplete.backgroundColor = {
            red: 0,
            green: 1,
            blue: 0
        }
        statusCellComplete.value = 'Status: COMPLETE';
        await statusCellComplete.save();
        await metaSheet.saveUpdatedCells();

        genLock = false;
        console.log('Master Sheet Generated Successfully!');
    } catch (e) {
        console.error(e);
        genLock = false;
        res.status(500).send({
            code: 1,
            message: 'Failed to generate Master Sheet!',
            data: {
                error: e
            }
        });
        return;
    }

});

batchRouter.post('/create', async(req: Request,res: Response)=>{
    // TODO: Implement batch creation of streams
    void req;
    void res;
});

export default batchRouter;