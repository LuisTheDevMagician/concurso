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
  cor: string;
  dias_semana: string;
  link_material: string | null;
  created_at: string;
}

export interface Materia {
  id: number;
  disciplina_id: number;
  nome: string;
  estudado: boolean;
  created_at: string;
}

export interface WithProgress {
  total: number;
  estudadas: number;
}

export interface Revisao {
  id: number;
  materia_id: number;
  data: string;
  revisao_numero: number;
  created_at: string;
}

export interface RevisaoComMateria extends Revisao {
  materia_nome: string;
  disciplina_id: number;
  disciplina_nome: string;
  disciplina_cor: string;
}
