import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TaskService } from '../services/task.service';
import { TaskInterface } from '../models/task.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {
  tasks: TaskInterface[] = [];

  constructor(
    private navController: NavController,
    private taskService: TaskService
  ) {}

  // каждый раз при входе на экран обновляем список
  ionViewWillEnter() {
    this.loadTasks();
  }

  private async loadTasks() {
    this.tasks = await this.taskService.getTasks();
  }

  openTaskDetails() {
    this.navController.navigateForward('/task-details');
  }

  async toggleComplete(task: TaskInterface) {
    await this.taskService.updateTask({ ...task, completed: !task.completed });
    this.loadTasks();
  }

  async deleteTask(id: number) {
    await this.taskService.deleteTask(id);
    this.loadTasks();
  }
}
