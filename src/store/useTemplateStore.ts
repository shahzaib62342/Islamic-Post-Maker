import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type PosterState } from './usePosterStore';

export interface Template {
  id: string;
  name: string;
  createdAt: number;
  state: Partial<PosterState>;
}

interface TemplateState {
  templates: Template[];
  saveTemplate: (name: string, currentState: PosterState) => void;
  deleteTemplate: (id: string) => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set) => ({
      templates: [],
      saveTemplate: (name, currentState) => set((state) => {
        // Remove all function properties and transient state from the saved template
        const cleanedState = Object.fromEntries(
          Object.entries(currentState).filter(([key, value]) => typeof value !== 'function' && key !== 'isDownloading' && key !== 'isModalOpen')
        );

        const newTemplate: Template = {
          id: Date.now().toString(),
          name,
          createdAt: Date.now(),
          state: cleanedState
        };

        return { templates: [newTemplate, ...state.templates] };
      }),
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
      }))
    }),
    {
      name: 'islamic-post-templates-storage'
    }
  )
);
