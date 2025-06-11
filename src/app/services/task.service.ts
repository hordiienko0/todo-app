import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TaskInterface } from '../models/task.interface';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private _storage: Storage | null = null;
  private readonly TASK_KEY = 'tasks';

  constructor(private storage: Storage) {
    this.init();
  }

  private async init() {
    this._storage = await this.storage.create();
  }

  async getTasks(): Promise<TaskInterface[]> {
    return (await this._storage?.get(this.TASK_KEY)) || [];
  }

  async addTask(task: TaskInterface): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this._storage?.set(this.TASK_KEY, tasks);
  }

  async updateTask(updated: TaskInterface): Promise<void> {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex(t => t.id === updated.id);
    if (idx > -1) {
      tasks[idx] = updated;
      await this._storage?.set(this.TASK_KEY, tasks);
    }
  }

  async deleteTask(id: number): Promise<void> {
    const tasks = (await this.getTasks()).filter(t => t.id !== id);
    await this._storage?.set(this.TASK_KEY, tasks);
  }
}
