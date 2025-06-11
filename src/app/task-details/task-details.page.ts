import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { TaskService } from '../services/task.service';
import { TaskInterface } from '../models/task.interface';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.page.html',
  styleUrls: ['./task-details.page.scss'],
  standalone: false
})
export class TaskDetailsPage {
  taskForm: FormGroup;
  editingTask?: TaskInterface;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private nav: NavController
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required],
      tags: [[]]
    });
  }

  ionViewWillEnter() {
    const id = history.state.id;
    if (id) {
      this.loadTask(id);
    }
  }

  private async loadTask(id: number) {
    const tasks = await this.taskService.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      this.editingTask = task;
      this.taskForm.patchValue(task);
    }
  }

  async saveTask() {
    const { title, description, dueDate, priority, tags } = this.taskForm.value;
    const base: TaskInterface = {
      id: this.editingTask ? this.editingTask.id : Date.now(),
      title,
      description,
      dueDate,
      priority,
      tags,
      completed: this.editingTask ? this.editingTask.completed : false,
    };

    if (this.editingTask) {
      await this.taskService.updateTask(base);
    } else {
      await this.taskService.addTask(base);
    }

    const notifyTime = new Date(new Date(dueDate).getTime() - 30 * 60 * 1000);
    await LocalNotifications.schedule({
      notifications: [{
        title: 'Задача скоро истекает',
        body: title,
        id: base.id,
        schedule: { at: notifyTime }
      }]
    });

    this.nav.back();
  }
}
