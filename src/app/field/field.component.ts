import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.css'],
})
export class FieldComponent implements OnInit, OnDestroy {

  difficultiesObject: object;
  difficultyLevels: string[];
  fieldEdgeSize: number;
  delay: number;
  fieldArray: number[];
  randomArray: number[] = [];
  fieldSize: number;
  timers = [];
  userCounter = 0;
  computerCounter = 0;
  intervalCounter = 0;
  isFirstGame = true;
  isGameStarted = false;
  winner = null;
  gameInterval: ReturnType<typeof setInterval>;

  @ViewChildren('cell') cellsList: QueryList<ElementRef>;
  @ViewChild('select') select: ElementRef;
  @ViewChild('board') board: ElementRef;
  @ViewChild('userName') userName: ElementRef;

  constructor(private http: HttpService) { }

  ngOnInit(): void {
    this.http.getSettings().subscribe((data: object) => {
      this.difficultiesObject = data;
      this.setSettings();
    });
  }

  setSettings(): void {
    if (!this.isFirstGame) {
      this.refreshField();
    }
    this.difficultyLevels = Object.keys(this.difficultiesObject);
    const selectValue = this.select.nativeElement.value || this.difficultyLevels[0];
    this.fieldEdgeSize = this.difficultiesObject[selectValue].field;
    this.fieldSize = this.fieldEdgeSize ** 2;
    this.delay = this.difficultiesObject[selectValue].delay;
    this.fieldArray = new Array(this.fieldSize);
    this.board.nativeElement.setAttribute('style', `width: ${this.fieldEdgeSize * 40}px`);
  }

  startGame(): void {
    this.isFirstGame = false;
    this.isGameStarted = true;
    this.computerCounter = 0;
    this.userCounter = 0;
    this.refreshField();
    this.randomArray = this.http.createRandomNumbers(this.fieldEdgeSize);
    this.gameInterval = setInterval(() => {
      const cellsArray = this.cellsList.toArray();

      if (this.computerCounter < Math.floor(this.fieldSize / 2)) {
        const randomNumber = this.randomArray[this.intervalCounter];
        this.paintCell(cellsArray[randomNumber], '#42D8E8');

        this.timers[randomNumber] = setTimeout(() => {
          this.computerCounter++;
          this.checkWinner();
          this.paintCell(cellsArray[randomNumber], '#E85A5F');
          this.timers[randomNumber] = null;
        }, this.delay);
      }

      this.checkWinner();
      this.intervalCounter++;
    }, this.delay);
  }

  refreshField(): void {
    const cellsArray = this.cellsList.toArray();
    for (let i = 0; i < this.fieldSize; i++) {
        this.paintCell(cellsArray[i], 'white');
    }
  }

  paintCell(element: ElementRef, color: string): void {
    element.nativeElement.setAttribute('style', `background:${color}`);
  }

  check(index: number): void {
    if (this.timers[index]) {
      const cellsArray = this.cellsList.toArray();
      clearTimeout(this.timers[index]);
      this.paintCell(cellsArray[index], '#00E871');
      this.userCounter++;
      this.checkWinner();
      this.timers[index] = null;
    }
  }

  checkWinner(): void {
    const halfField = Math.floor(this.fieldSize / 2);
    const user = this.userName.nativeElement.value  || 'Anonymous';
    if (this.fieldSize % 2 === 0) {
      if (this.computerCounter === halfField &&
        this.userCounter === halfField) {
          this.postWinner('Draw');
          this.finishGame();
        }
      }
    if (this.userCounter === halfField + 1) {
      this.postWinner(user);
      this.finishGame(user);
    }
    if (this.computerCounter === halfField + 1) {
      this.postWinner('Computer');
      this.finishGame('Computer');
    }
  }

  postWinner(winner: string): void {
    const time = new Date().toLocaleString();
    this.http.postWinners({winner : `${winner}`, date : time}).subscribe(() => {
      this.http.finishGame.next(true);
    });
  }

  finishGame(winner?: string): void {
    clearInterval(this.gameInterval);
    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.intervalCounter = 0;
    this.isGameStarted = false;
    this.winner = 'It`s a drow';
    if (winner) {
      this.winner = `${winner} won`;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.gameInterval);
    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });
  }
}
