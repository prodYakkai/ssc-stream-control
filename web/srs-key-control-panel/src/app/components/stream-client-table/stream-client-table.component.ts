import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SrsService } from '../../services/srs.service';

@Component({
  selector: 'app-stream-client-table',
  standalone: true,
  imports: [],
  templateUrl: './stream-client-table.component.html',
  styleUrl: './stream-client-table.component.less'
})
export class StreamClientTableComponent implements OnInit {
  public streamClientList: any[] = [];
  public isLoading = false;
  public lastUpdatedOn = new Date();
  public environment = environment;

  constructor(
    private srsService: SrsService,
  ) { }

  ngOnInit(): void {
    this.getStreamClientList();
  }

  getStreamClientList(): void {
    this.isLoading = true;
  }

}
