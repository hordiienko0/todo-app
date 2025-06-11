import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TaskService } from '../services/task.service';
import { TaskInterface } from '../models/task.interface';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  animations: [
    trigger('itemAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out')
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ],
  standalone: false
})
export class HomePage {
  tasks: TaskInterface[] = [];
  searchTerm = '';
  statusFilter: 'all' | 'completed' | 'pending' = 'all';
  tagFilter: string[] = [];
  allTags: string[] = [];

  constructor(
    private navController: NavController,
    private taskService: TaskService
  ) {}

  ionViewWillEnter() {
    this.loadTasks();
  }

  private async loadTasks() {
    const all = await this.taskService.getTasks();
    this.allTags = Array.from(
      new Set(
        all.reduce((acc: string[], task: TaskInterface) => {
          return acc.concat(task.tags);
        }, [])
    )
);
    this.tasks = all;
  }

  openTaskDetails(task?: TaskInterface) {
    const extras = task ? { state: { id: task.id } } : undefined;
    this.navController.navigateForward('/task-details', extras);
  }

  async toggleComplete(task: TaskInterface) {
    await this.taskService.updateTask({ ...task, completed: !task.completed });
    this.applyFilters();
  }

  async deleteTask(id: number) {
    await this.taskService.deleteTask(id);
    this.applyFilters();
  }

  async applyFilters() {
    let tasks = await this.taskService.searchTasks(this.searchTerm);
    if (this.statusFilter !== 'all' || this.tagFilter.length) {
      tasks = await this.taskService.filterTasks(this.statusFilter, this.tagFilter);
    }
    this.tasks = tasks;
  }

  async reorder(ev: CustomEvent) {
    const from = (ev as any).detail.from;
    const to = (ev as any).detail.to;
    const items = [...this.tasks];
    items.splice(to, 0, items.splice(from, 1)[0]);
    (ev as any).detail.complete();
    await this._saveOrder(items);
    this.tasks = items;
  }

  private async _saveOrder(tasks: TaskInterface[]) {
    for (const task of tasks) {
      await this.taskService.updateTask(task);
    }
  }
}

