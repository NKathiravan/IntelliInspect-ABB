import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

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
  recordCount = 0;
  columnCount = 5;
  passRate = 70;
  startDate = '2021-01-01';
  endDate = '2021-12-31';

  constructor(private apiService: ApiService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileUploaded = true;
      this.fileName = file.name;
      this.fileSize = (file.size / 1024).toFixed(1) + ' KB';
      this.fileURL = URL.createObjectURL(file);

      // Create a FormData object to properly package the file for upload
      const formData = new FormData();
      // 'file' is the key that your backend API will use to access the uploaded file
      formData.append('file', file, file.name);

      this.apiService.postFile(formData).subscribe({
        next: (res: any) => {
          console.log('File uploaded successfully:', res);
          this.columnCount=res.totalColumns;
          this.recordCount=res.totalRows;
          this.passRate=res.passRate;
          this.startDate=res.startTimestamp;
          this.endDate=res.endTimestamp;
          // You might want to update some component state here based on the response
        },
        error: (error: any) => {
          console.error('Error uploading file:', error);
          // Handle the error, maybe show a message to the user
        }
      });
    }
  }

  onNext(): void {
    // TODO: implement navigation
  }
}