-- Insert initial bathroom data
-- This script should be run after creating the tables

INSERT INTO bathrooms (
  id, name, building, x, y, floor, facilities, has_accessible
) VALUES
  ('tic_1', 'Casa de banho do TIC', 'Técnico Innovation Center',
   0.7, 70.3, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   true),

  ('informatica_ii_0', 'Casa de banho de Informática II', 'Pavilhão de Informática II',
   73.9, 45.8, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Barras de apoio'],
   true),

  ('accao_social_2', 'Casa de banho de Ação Social 2', 'Pavilhão de Ação Social',
   75.5, 70.8, '2', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Barras de apoio'],
   true),

  ('accao_social_0', 'Casa de banho de Ação Social', 'Pavilhão de Ação Social',
   77.9, 70.9, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   false),

  ('informatica_i_1', 'Casa de banho de Informática I Piso 1', 'Pavilhão de Informática I',
   76.1, 35.2, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('torre_norte_0', 'Casa de banho da Torre Norte Principal', 'Torre Norte',
   63.5, 41.6, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   true),

  ('minas_1', 'Casa de banho de Minas 1', 'Edifício de Minas',
   64.6, 71.6, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('accao_social_1', 'Casa de banho de Ação Social 1', 'Pavilhão de Ação Social',
   74.9, 71.7, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('informatica_i_-1', 'Casa de banho de Informática I', 'Pavilhão de Informática I',
   74.2, 35.2, '-1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('minas_2', 'Casa de banho de Minas 2', 'Edifício de Minas',
   67.1, 70.8, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('minas_4', 'Casa de banho de Minas 4', 'Edifício de Minas',
   70.9, 69.5, '4', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('accao_social_3', 'Casa de banho de Ação Social 3', 'Pavilhão de Ação Social',
   76.3, 70.7, '3', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('informatica_i_0', 'Casa de banho de Informática I Piso 0', 'Pavilhão de Informática I',
   72.8, 34.8, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('informatica_iii_0', 'Casa de banho de Informática III', 'Pavilhão de Mecânica II',
   77.7, 39.4, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('quimica_1', 'Casa de banho Gabinetes', 'Pavilhão de Química',
   65.5, 63.0, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('torre_norte_-1', 'Casa de banho da Torre Norte', 'Torre Norte',
   63.0, 39.1, '-1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('minas_3', 'Casa de banho de Minas 3', 'Edifício de Minas',
   62.2, 70.6, '3', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('informatica_i_2', 'Casa de banho de Informática I Piso 2', 'Pavilhão de Informática I',
   73.5, 34.6, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('mecanica_ii_0', 'Casa de banho de Mecânica II', 'Pavilhão de Mecânica II',
   82.1, 43.6, '0', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('torre_norte_1', 'Casa de banho da Torre Norte 1', 'Torre Norte',
   61.9, 42.0, '1', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('torre_norte_6', 'Casa de banho da Torre Norte 6', 'Torre Norte',
   60.6, 39.4, '6', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('civil_-2', 'Casa de banho de Civil', 'Edifício de Civil',
   39.6, 42.9, '-2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('informatica_iii_2', 'Casa de banho de Informática III Piso 2', 'Pavilhão de Informática III',
   78.4, 40.3, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('mecanica_i_2', 'Casa de banho de Mecânica I Piso 2', 'Pavilhão de Mecânica I',
   60.6, 44.3, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('mecanica_ii_2', 'Casa de banho de Mecânica II Piso 2', 'Pavilhão de Mecânica II',
   80.4, 43.4, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('torre_norte_4', 'Casa de banho da Torre Norte 4', 'Torre Norte',
   64.8, 41.7, '4', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('torre_norte_8', 'Casa de banho da Torre Norte 8', 'Torre Norte',
   62.0, 37.0, '8', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('mecanica_i_1', 'Casa de banho de Mecânica I', 'Pavilhão de Mecânica I',
   62.2, 45.0, '1', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('mecanica_ii_1', 'Casa de banho de Mecânica II Piso 1', 'Pavilhão de Mecânica II',
   79.0, 44.0, '1', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('mecanica_iv_1', 'Casa de banho de Mecânica IV Piso 1', 'Pavilhão de Mecânica IV',
   73.7, 41.7, '1', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('torre_norte_5', 'Casa de banho da Torre Norte 5', 'Torre Norte',
   63.0, 41.5, '5', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('torre_norte_9', 'Casa de banho da Torre Norte 9', 'Torre Norte',
   63.8, 40.5, '9', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false),

  ('mecanica_i_3', 'Casa de banho de Mecânica I Piso 3', 'Pavilhão de Mecânica I',
   68.1, 42.9, '3', ARRAY['Papel higiénico', 'Sabão'],
   false),

  ('mecanica_iv_0', 'Casa de banho de Mecânica IV', 'Pavilhão de Mecânica IV',
   72.7, 41.2, '0', ARRAY['Papel higiénico', 'Sabão'],
   false),

  ('torre_norte_7', 'Casa de banho da Torre Norte 7', 'Torre Norte',
   61.3, 41.5, '7', ARRAY['Papel higiénico', 'Sabão'],
   false),

  ('torre_norte_11', 'Casa de banho da Torre Norte 11', 'Torre Norte',
   62.3, 40.9, '11', ARRAY['Papel higiénico', 'Sabão'],
   false),

  ('mecanica_iv_2', 'Casa de banho de Mecânica IV Piso 2', 'Pavilhão de Mecânica IV',
   73.1, 39.9, '2', ARRAY['Papel higiénico', 'Sabão'],
   false),

  ('torre_norte_10', 'Casa de banho da Torre Norte 10', 'Torre Norte',
   63.8, 41.2, '10', ARRAY['Papel higiénico', 'Sabão'],
   false),

  ('pavilhao_central_-1', 'Casa de banho do Pavilhão Central Piso -1', 'Pavilhão Central',
   52.4, 51.8, '-1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('pavilhao_central_0', 'Casa de banho do Pavilhão Central', 'Pavilhão Central',
   52.0, 52.0, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   false),

  ('matematica_0', 'Casa de banho do Pavilhão de Matemática', 'Pavilhão de Matemática',
   41.0, 66.9, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('matematica_1', 'Casa de banho do Pavilhão de Matemática Piso 1', 'Pavilhão de Matemática',
   41.0, 63.9, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false),

  ('fisica_0', 'Casa de banho do Pavilhão de Física', 'Pavilhão de Física',
   44.9, 75.1, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   true);

-- Insert some sample reviews for the Torre Norte bathroom
INSERT INTO reviews (bathroom_id, user_name, rating, comment, date, cleanliness, paper_supply, privacy) VALUES
  ('torre_norte_0', 'João Silva', 4, 'Sempre limpo e bem equipado. Boa localização no centro do campus.', '2024-12-15', 4, 4, 4);