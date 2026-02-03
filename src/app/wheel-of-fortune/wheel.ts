import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { WheelDataService } from "./wheel-data";

const COLORS = [
  { bg: "#FF0000", text: "#FFFFFF" }, // Rood - witte tekst
  { bg: "#FFFF00", text: "#000000" }, // Geel - zwarte tekst
  { bg: "#00AA00", text: "#FFFFFF" }, // Groen - witte tekst
  { bg: "#0066FF", text: "#FFFFFF" }  // Blauw - witte tekst
] as const;

@Component({
  providers: [WheelDataService],
  standalone: false,
  selector: "app-wheel",
  templateUrl: "./wheel.html",
  styleUrls: ["./wheel.scss"]
})
export class Wheel implements OnInit, AfterViewInit {
  private readonly _dataService = inject(WheelDataService);
  private readonly _dialog = inject(MatDialog);
  private readonly _nummer11 = new Audio('/assets/Nummer-11.mp3');
  private readonly _heySlay = new Audio('/assets/HEY-SLAY.mp3');
  
  private readonly _wheel = viewChild.required<ElementRef<HTMLCanvasElement>>('wheel');
  private readonly _spin = viewChild.required<ElementRef>('spin');
  
  private _hasOptions = true;
  private _sectors: Array<{ color: string; textColor: string; label: string }> = [];
  private _ctx: CanvasRenderingContext2D | null = null;
  private _dia = 0;
  private _tot = 0;
  private _rad = 0;
  private readonly _PI = Math.PI;
  private readonly _TAU = 2 * Math.PI;
  private _arc0 = 0;
  private _angVel = 0; // Angular velocity
  private _ang = 0; // Angle in radians
  private _lastSelection: number | null = null;
  private readonly _friction = 0.996; // 0.995=soft, 0.99=mid, 0.98=hard
  
  readonly optionsText = signal('');
  readonly isSpinning = signal(false);
  
  constructor() {
    this._heySlay.preload = 'auto';
    this._nummer11.preload = 'auto';
    this._nummer11.volume = 0.8;

    // Laad initiële waarden
    const initialOptions = this._dataService.getOptions();
    this.optionsText.set(initialOptions.join('\n'));

    this._dataService.option$?.subscribe(options => {
      this._setOptions(options);
      this.optionsText.set(options.join('\n'));
    }); 
  }

  ngOnInit(): void {
    this._engine();
  }
  
  ngAfterViewInit(): void {
    this._createWheel();
  }

  updateOptions(): void {
    const newOptions = this.optionsText()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    this._dataService.optionSource.next(newOptions);
    this._dataService.persistOptions();
  }

  spinner(): void {
    if (!this._hasOptions || this._angVel) {
      return;
    }
    
    this.isSpinning.set(true);
    this._nummer11.currentTime = 2.25;
    this._nummer11.play();
    
    this._angVel = this._rand(0.25, 0.35);
  }

  private _setOptions(values: string[]): void {
    // Check of er opties zijn
    if (values.length === 0) {
      this._hasOptions = false;
      this._sectors = [{
        color: "#CCCCCC",
        textColor: "#666666",
        label: "Geen opties"
      }];
    } else {
      this._hasOptions = true;
      this._sectors = values.map((opts, i) => {
        const colorObj = COLORS[i % COLORS.length];
        return {
          color: colorObj.bg,
          textColor: colorObj.text,
          label: opts
        };
      });
    }

    if (this._wheel()) {
      this._createWheel();
    }
    
    // Reset spinning state als rad opnieuw wordt gemaakt
    if (!this._angVel) {
      this.isSpinning.set(false);
    }
  }

  private _createWheel(): void {
    this._ctx = this._wheel().nativeElement.getContext("2d");
    if (!this._ctx) return;
    
    this._dia = this._ctx.canvas.width;
    this._tot = this._sectors.length;
    this._rad = this._dia / 2;
    this._arc0 = this._TAU / this._sectors.length;
    
    this._sectors.forEach((sector, i) => this._drawSector(sector, i));
    this._rotate(true);
  }

  private _rand(m: number, M: number): number {
    return Math.random() * (M - m) + m;
  }

  private _getIndex(): number {
    return Math.floor(this._tot - (this._ang / this._TAU) * this._tot) % this._tot;
  }

  private _drawSector(sector: { color: string; textColor: string; label: string }, i: number): void {
    if (!this._ctx) return;
    
    const ang = this._arc0 * i;
    this._ctx.save();
    
    // COLOR
    this._ctx.beginPath();
    this._ctx.fillStyle = sector.color;
    this._ctx.moveTo(this._rad, this._rad);
    this._ctx.arc(this._rad, this._rad, this._rad, ang, ang + this._arc0);
    this._ctx.lineTo(this._rad, this._rad);
    this._ctx.fill();
    
    // TEXT
    this._ctx.translate(this._rad, this._rad);
    this._ctx.rotate(ang + this._arc0 / 2);
    this._ctx.textAlign = "right";
    this._ctx.fillStyle = sector.textColor;
    this._ctx.font = "bold 30px sans-serif";
    this._ctx.fillText(sector.label, this._rad - 10, 10);
    
    this._ctx.restore();
  }

  private _rotate(first = false): void {
    if (!this._ctx) return;
    
    const sector = this._sectors[this._getIndex()];
    this._ctx.canvas.style.transform = `rotate(${this._ang - this._PI / 2}rad)`;
    this._spin().nativeElement.textContent = !this._angVel ? "spin" : sector.label;
    
    if (!first) {
      this._lastSelection = !this._angVel ? this._lastSelection : this._getIndex();
    }
    
    this._spin().nativeElement.style.background = sector.color;
    this._spin().nativeElement.style.color = sector.textColor;
  }

  private _frame(): void {
    if (!this._angVel) return;

    this._angVel *= this._friction;
    
    if (this._angVel < 0.0001) {
      this._angVel = 0;
      this.isSpinning.set(false);
      this._nummer11.load();
      this._heySlay.play();
      
      const winner = this._sectors[this._getIndex()].label;
      this._showWinnerDialog(winner);
    }
    
    this._ang += this._angVel;
    this._ang %= this._TAU;
    this._rotate();
  }

  private _engine(): void {
    this._frame();
    requestAnimationFrame(() => this._engine());
  }

  private _showWinnerDialog(winner: string): void {
    const dialogRef = this._dialog.open(WinnerDialog, {
      data: { winner },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isSpinning.set(false);
      
      if (result === 'remove') {
        const currentOptions = this.optionsText()
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && line !== winner);
        
        this.optionsText.set(currentOptions.join('\n'));
        this._dataService.optionSource.next(currentOptions);
        this._dataService.persistOptions();
      }
    });
  }
}

// Winner Dialog Component
@Component({
  selector: 'winner-dialog',
  standalone: false,
  template: `
    <h2 mat-dialog-title>🎉 Winnaar! 🎉</h2>
    <mat-dialog-content>
      <p style="font-size: 24px; text-align: center; margin: 20px 0; font-weight: bold;">
        {{ data.winner }}
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="'close'">Sluiten</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="'remove'">
        Verwijderen uit lijst
      </button>
    </mat-dialog-actions>
  `
})
export class WinnerDialog {
  data = inject<{ winner: string }>(MAT_DIALOG_DATA);
}
