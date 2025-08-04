import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent {
  fileUploaded = false;
  fileName = '';
  fileSize = '';
  fileURL = '';
  recordCount = '14,704';
  columnCount = '5';
  passRate = '70%';
  dateRange =
    '<span class="daterange-strong">2021-01-01</span> to 2021-12-31';

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileUploaded = true;
      this.fileName = file.name;
      this.fileSize = (file.size / 1024).toFixed(1) + ' KB';
      this.fileURL = URL.createObjectURL(file);
    }
  }

  onNext(): void {
    // TODO: implement navigation
  }
}
