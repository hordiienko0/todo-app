import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { TaskService } from '../services/task.service';
import { TaskInterface } from '../models/task.interface';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.page.html',
  styleUrls: ['./task-details.page.scss'],
  standalone: false
})
export class TaskDetailsPage {
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private nav: NavController
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
    });
  }

  async saveTask() {
    const { title, description } = this.taskForm.value;
    const newTask: TaskInterface = {
      id: Date.now(),
      title,
      description,
      completed: false,
    };
    await this.taskService.addTask(newTask);
    this.nav.back();
  }
}
