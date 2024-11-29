/*
 * File: AuditTrail.d.ts
 * Project: srs-key-control
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

import { AuditTrailAction } from '@prisma/client';


export interface AuditTrailPayload {
    action: AuditTrailAction;
    actor: string;
    target: string;
    success?: boolean;
}