import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-cropper-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cropper-overlay">
      <div class="cropper-content">
        <!-- Header Completely Removed -->
        
        <div class="viewport-container">
           <!-- The 9:16 frame -->
           <div class="crop-frame" #cropFrame>
              <!-- Container for Panning -->
              <div class="pan-container" 
                   [style.transform]="getPanTransform()"
                   (mousedown)="startDrag($event)"
                   (touchstart)="startDrag($event)">
                   
                   <!-- Image Scaled by Zoom -->
                   <img [src]="imageUrl" 
                        [style.transform]="getZoomTransform()"
                        class="source-image" 
                        #imageElement
                        draggable="false">
              </div>

              <!-- Overlay Title on top of everything -->
              <h3 class="overlay-title">Ajustar Imagem</h3>
           </div>
        </div>

        <div class="controls">
            <span class="zoom-label">Zoom</span>
            <input type="range" class="zoom-slider" min="0.1" max="5" step="0.1" 
                   [value]="scale" (input)="onZoomChange($event)">
        </div>

        <div class="cropper-actions">
          <button class="btn-cancel" (click)="cancel()" [disabled]="isProcessing">Cancelar</button>
          <button class="btn-secondary" (click)="resetToFit()" [disabled]="isProcessing">Manter Inteira</button>
          <button class="btn-confirm" (click)="confirm()" [disabled]="isProcessing">
            <span *ngIf="!isProcessing">Confirmar</span>
            <span *ngIf="isProcessing" class="loading-text">
                <span class="spinner"></span> Salvando...
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cropper-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100dvh; /* Dynamic Height */
      background: rgba(0,0,0,0.95);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .cropper-content {
      background: white;
      width: 100%;
      height: 100%;
      max-height: 100dvh; /* Ensure it respects screen */
      display: flex;
      flex-direction: column;
      
      padding-bottom: env(safe-area-inset-bottom); /* Fix for iPhone X+ / Android Bars */

      @media(min-width: 768px) {
        width: 500px;
        height: 90vh; /* Slightly smaller on desktop */
        max-height: 900px;
        border-radius: 12px;
        overflow: hidden;
        padding-bottom: 0; /* Reset on desktop */
      }
    }

    /* Header Removed */

    .viewport-container {
      flex: 1;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      padding: 0;
      user-select: none;
    }

    .crop-frame {
      height: 100%; 
      aspect-ratio: 9 / 16;
      width: auto;
      max-width: 100%;
      
      margin: 0 auto; 
      
      position: relative;
      overflow: hidden;
      background: #000;
      cursor: grab;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    }
    
    .overlay-title {
        position: absolute;
        top: 20px;
        left: 0;
        width: 100%;
        text-align: center;
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
        z-index: 50; /* High z-index */
        pointer-events: none;
        text-shadow: 0 2px 8px rgba(0,0,0,1); /* Stronger shadow */
        margin: 0;
    }

    .crop-frame::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 2px solid rgba(255,255,255,0.5);
      box-sizing: border-box;
      pointer-events: none;
      z-index: 10;
    }

    .crop-frame:active {
        cursor: grabbing;
    }

    .pan-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: auto; /* Catch drags */
    }

    .source-image {
        position: relative; /* Not absolute, so it sits in center of pan-container */
        max-width: initial;
        max-height: initial;
        /* We control size manually via JS, or let it be natural. */
        user-drag: none;
        -webkit-user-drag: none;
        pointer-events: none;
        transform-origin: center center;
    }

    .controls {
        background: white;
        padding: 10px 15px; /* Reduced vertical padding */
        margin-bottom: 50px;
        display: flex;
        align-items: center;
        gap: 15px;
        border-top: 1px solid #eee;
    }
    
    .zoom-label { font-weight: 600; color: #555; font-size: 0.9rem; }
    .zoom-slider { flex: 1; cursor: pointer; }

    .cropper-actions {
      padding: 10px 15px; /* Reduced vertical padding */
      display: flex;
      gap: 10px;
      background: white;
      
      button {
        flex: 1;
        padding: 10px; /* Smaller buttons */
        border: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        transition: opacity 0.2s;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-cancel { background: #f5f5f5; color: #666; }
      .btn-secondary { background: #e1bee7; color: #7b1fa2; }
      .btn-confirm { background: linear-gradient(135deg, #9c27b0, #E91E63); color: white; }
    }
    
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
  `]
})
export class CropperModalComponent implements AfterViewInit {
  @Input() imageChangedEvent: any = '';
  @Output() cropConfirm = new EventEmitter<Blob>();
  @Output() cropCancel = new EventEmitter<void>();

  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('cropFrame') cropFrame!: ElementRef<HTMLDivElement>;

  imageUrl: string = '';

  scale = 1;
  posX = 0;
  posY = 0;

  isDragging = false;
  lastMouseX = 0;
  lastMouseY = 0;
  isProcessing = false;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.imageChangedEvent && this.imageChangedEvent.target.files && this.imageChangedEvent.target.files[0]) {
      const file = this.imageChangedEvent.target.files[0];
      this.imageUrl = URL.createObjectURL(file);
    }
  }

  ngAfterViewInit() {
    const img = this.imageElement.nativeElement;
    img.onload = () => {
      this.resetToCover();
    };
  }

  resetToCover() {
    // Reset Image Size to Natural
    const img = this.imageElement.nativeElement;
    img.style.width = img.naturalWidth + 'px';
    img.style.height = img.naturalHeight + 'px';

    // Calculate scale to cover frame
    const frameRect = this.cropFrame.nativeElement.getBoundingClientRect();
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const frameRatio = frameRect.width / frameRect.height;

    if (imgRatio < frameRatio) {
      // Image thinner. Match width.
      this.scale = frameRect.width / img.naturalWidth;
    } else {
      // Image wider. Match height.
      this.scale = frameRect.height / img.naturalHeight;
    }

    this.posX = 0;
    this.posY = 0;
  }

  resetToFit() {
    const img = this.imageElement.nativeElement;
    const frameRect = this.cropFrame.nativeElement.getBoundingClientRect();
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const frameRatio = frameRect.width / frameRect.height;

    // To fit completely inside
    if (imgRatio < frameRatio) {
      // Thinner, constrained by Height
      this.scale = frameRect.height / img.naturalHeight;
    } else {
      // Wider, constrained by Width
      this.scale = frameRect.width / img.naturalWidth;
    }
    this.posX = 0;
    this.posY = 0;
  }

  onZoomChange(event: any) {
    this.scale = parseFloat(event.target.value);
  }

  getPanTransform() {
    return `translate(${this.posX}px, ${this.posY}px)`;
  }

  getZoomTransform() {
    return `scale(${this.scale})`;
  }

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isDragging = true;
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    this.lastMouseX = clientX;
    this.lastMouseY = clientY;

    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('touchmove', this.onDrag, { passive: false });
    window.addEventListener('touchend', this.stopDrag);
  }

  onDrag = (event: MouseEvent | TouchEvent) => {
    if (!this.isDragging) return;

    const clientX = window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientY : (event as MouseEvent).clientY;

    const deltaX = clientX - this.lastMouseX;
    const deltaY = clientY - this.lastMouseY;

    this.posX += deltaX;
    this.posY += deltaY;

    this.lastMouseX = clientX;
    this.lastMouseY = clientY;
  }

  stopDrag = () => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
    window.removeEventListener('touchmove', this.onDrag);
    window.removeEventListener('touchend', this.stopDrag);
  }

  confirm() {
    if (!this.imageElement || this.isProcessing) return; // Prevent double clicks

    this.isProcessing = true;

    const img = this.imageElement.nativeElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      this.isProcessing = false;
      return;
    }

    // Set high resolution output
    canvas.width = 1080;
    canvas.height = 1920;

    // Clear background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate source rect (relative to image)
    // We need to map the "crop-frame" visible area back to the image source coordinates.

    // 1. Get the current rendered screen positions
    const frameRect = this.cropFrame.nativeElement.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // 2. Calculate the ratio between actual image natural size and rendered size
    // Note: imgRect includes the zoom scale!
    // Natural aspect logic:

    // The image is visually "inside" the frame.
    // Left offset of image relative to frame:
    // (imgRect.left - frameRect.left) + borderOffset
    // But we removed border, so just diff.

    const scaleDisplayed = imgRect.width / img.naturalWidth; // Current visual scale relative to natural

    const relativeX = frameRect.left - imgRect.left;
    const relativeY = frameRect.top - imgRect.top;

    // Map these frame-relative coords to natural image coords
    const sourceX = relativeX / scaleDisplayed;
    const sourceY = relativeY / scaleDisplayed;

    const sourceWidth = frameRect.width / scaleDisplayed;
    const sourceHeight = frameRect.height / scaleDisplayed;

    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight, // Source crop
      0, 0, canvas.width, canvas.height // Dest
    );

    canvas.toBlob((blob) => {
      if (blob) {
        this.cropConfirm.emit(blob);
        this.cropCancel.emit(); // Close the modal after confirming
      }
      this.isProcessing = false; // Reset just in case
    }, 'image/jpeg', 0.9);
  }

  cancel() {
    this.cropCancel.emit();
  }
}
