import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../shared/models/user';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-admin-user-edit',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf
  ],
  templateUrl: './admin-user-edit.component.html',
  styleUrls: ['./admin-user-edit.component.scss']
})
export class AdminUserEditComponent implements OnInit {
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdminUserEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  ngOnInit() {
    // Name pattern allows letters, spaces, hyphens and apostrophes
    const namePattern = "^[a-zA-Z\\s\\-']+$";

    this.userForm = this.fb.group({
      firstName: [
        this.data.user['firstName'],  // Use bracket notation here
        [Validators.pattern(namePattern)]
      ],
      lastName: [
        this.data.user['lastName'],   // Use bracket notation here
        [Validators.pattern(namePattern)]
      ]
    });
  }

  onConfirmChanges() {
    if (this.userForm.valid && this.userForm.dirty) {
      // Update user object with form values using bracket notation
      this.data.user['firstName'] = this.userForm.value.firstName;
      this.data.user['lastName'] = this.userForm.value.lastName;
      this.dialogRef.close(this.data.user);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
