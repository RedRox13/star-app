import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export class HttpService {

  finishGame = new BehaviorSubject(null);
  constructor(private http: HttpClient) { }

  getSettings(): Observable<object> {
    return this.http.get('https://starnavi-frontend-test-task.herokuapp.com/game-settings');
  }

  getWinners(): Observable<object> {
    return this.http.get('https://starnavi-frontend-test-task.herokuapp.com/winners');
  }

  postWinners(object: object): Observable<object> {
    return this.http.post('https://starnavi-frontend-test-task.herokuapp.com/winners', object);
  }

  createRandomNumbers(size: number): number[] {
    const field = size ** 2;
    const result = [];
    while (result.length < field) {
      const random: number = Math.floor(Math.random() * field);
      if (result.indexOf(random) === -1) {
        result.push(random);
      }
    }

    return result;
  }
}
