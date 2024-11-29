import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SRSClientResponse, SRSClientsResponse, SRSStreamResponse, SRSStreamsResponse } from '../../types/SRS';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SrsService {

  constructor(
    private http: HttpClient
  ) { }


  getStreams() {
    return this.http.get<SRSStreamsResponse>(environment.apiHost + '/srs-proxy/streams');
  }

  getStream(streamId: string) {
    return this.http.get<SRSStreamResponse>(environment.apiHost + '/srs-proxy/streams/' + streamId);
  }

  getClients() {
    return this.http.get<SRSClientsResponse>(environment.apiHost + '/srs-proxy/clients');
  }

  getClient(clientId: string) {
    return this.http.get<SRSClientResponse>(environment.apiHost + '/srs-proxy/clients/' + clientId);
  }

}
