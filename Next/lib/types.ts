export interface Concurso {
  id: number;
  nome: string;
  cor: string;
  created_at: string;
}

export interface Disciplina {
  id: number;
  concurso_id: number;
  nome: string;
  created_at: string;
}

export interface Materia {
  id: number;
  disciplina_id: number;
  nome: string;
  estudado: number;
  created_at: string;
}

export interface WithProgress {
  total: number;
  estudadas: number;
}
