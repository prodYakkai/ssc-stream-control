import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { KeyService } from '../../services/key.service';
import { EventService } from '../../services/event.service';
import { ReservedDestination } from '@prisma/client';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { FormsModule } from '@angular/forms';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { StreamWithAll } from '../../../types/Stream';
import { SrsService } from '../../services/srs.service';
import { Stream as SRSStream } from '../../../types/SRS';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { NzInputModule } from 'ng-zorro-antd/input';
@Component({
  selector: 'app-stream-detail',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NzButtonModule,
    NzTreeSelectModule,
    NzSelectModule,
    FormsModule,
    NzCheckboxModule,
    NzSpinModule,
    NzGridModule,
    NzTagModule,
    NzTableModule,
    NzDescriptionsModule,
    FileSizePipe,
    NzInputModule
  ],
  templateUrl: './stream-detail.component.html',
  styleUrl: './stream-detail.component.less'
})
export class StreamDetailComponent implements OnInit {

  currentEventId: string = '';
  id = '';
  destination: ReservedDestination | null = null;
  stream: StreamWithAll | null = null;
  srsInfo: SRSStream | null = null;

  destinationPatchNode: NzTreeNodeOptions[] = [];
  selectedDestinationId: string = '';
  disconnectOnPatch = false;

  disconnectOnRotateKey = false;

  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private keyService: KeyService,
    private eventService: EventService,
    private messageService: NzMessageService,
    private srsService: SrsService
  ) {}

  ngOnInit(): void {
    this.currentEventId = this.eventService.getLocalCurrentEvent();
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.loadStream(this.id);
    });
  }

  loadStream(id: string) {
    this.isLoading = true;
    this.keyService.getKeyDetail(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.stream = res.data;
        if (this.stream.destination) {
          this.selectedDestinationId = this.stream.destination.id;
        }
        if(this.stream.srsIngestStreamId){
          this.loadSRSDetail(this.stream.srsIngestStreamId);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }
    })
  }

  loadSRSDetail(id: string) {
    this.srsService.getStream(id).subscribe({
      next: (res) => {
        this.srsInfo = res.stream;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  loadDestinationPatch(){
    this.eventService.getDestinations(this.currentEventId).subscribe({
      next: (res) => {
        if (res.code < 0){
          console.error(res);
          return;
        }

        this.destinationPatchNode = res.data.map((destination) => {
          return {
            title: destination.name,
            key: destination.id,
            isLeaf: true,
            disabled: destination.streamId !== null 
          }
        });
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  onOpenDestinationSelect(){
    this.loadDestinationPatch();
  }
  

  patchDestination(){
    if (!this.selectedDestinationId){
      console.error('Destination is not selected');
      return;
    }

    if (!this.stream){
      console.error('Stream is not loaded');
      return;
    }

    this.keyService.rerouteStream(this.stream.id, this.selectedDestinationId, this.disconnectOnPatch).subscribe({
      next: (res) => {
        if (res.code < 0){
          console.error(res);
          return;
        }

        this.loadStream(this.stream?.id as string);
        this.messageService.success('Destination patched successfully');
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  rotateKey(type: 'ingest' | 'view' | 'all'){
    if (!this.stream){
      console.error('Stream is not loaded');
      return;
    }

    this.keyService.rotateKey(this.stream.id, type, this.disconnectOnRotateKey, false).subscribe({
      next: (res) => {
        if (res.code < 0){
          console.error(res);
          return;
        }

        this.loadStream(this.stream?.id as string);
        this.messageService.success('Key rotated successfully');
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  updateStream(){
    if (!this.stream){
      console.error('Stream is not loaded');
      return;
    }

    this.keyService.updateKey(this.stream).subscribe({
      next: (res) => {
        if (res.code < 0){
          console.error(res);
          return;
        }

        this.loadStream(this.stream?.id as string);
        this.messageService.success('Stream updated successfully');
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

}
