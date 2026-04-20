import { contextBridge, ipcRenderer } from 'electron';
import { createNightwardApi } from './nightward-api';

contextBridge.exposeInMainWorld('nightward', createNightwardApi(ipcRenderer));
