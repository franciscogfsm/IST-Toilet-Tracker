-- Insert initial bathroom data
-- This script should be run after creating the tables

INSERT INTO bathrooms (
  id, name, building, distance, rating, review_count, cleanliness,
  x, y, floor, facilities, accessibility, paper_supply, privacy, last_cleaned
) VALUES
  ('tic_1', 'Casa de banho do TIC', 'Técnico Innovation Center', 300, 4.5, 15, 'Sempre limpo',
   0.7, 70.3, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   true, 'Bom', 'Excelente', '30 minutos atrás'),

  ('informatica_ii_0', 'Casa de banho de Informática II', 'Pavilhão de Informática II', 160, 4.4, 18, 'Sempre limpo',
   73.9, 45.8, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Barras de apoio'],
   true, 'Bom', 'Excelente', '1 hora atrás'),

  ('accao_social_2', 'Casa de banho de Ação Social 2', 'Pavilhão de Ação Social', 88, 4.3, 22, 'Sempre limpo',
   75.5, 70.8, '2', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Barras de apoio'],
   true, 'Bom', 'Excelente', '1 hora atrás'),

  ('accao_social_0', 'Casa de banho de Ação Social', 'Pavilhão de Ação Social', 80, 4.2, 35, 'Sempre limpo',
   77.9, 70.9, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   false, 'Bom', 'Excelente', '1 hora atrás'),

  ('informatica_i_1', 'Casa de banho de Informática I Piso 1', 'Pavilhão de Informática I', 155, 4.2, 32, 'Sempre limpo',
   76.1, 35.2, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('torre_norte_0', 'Casa de banho da Torre Norte Principal', 'Torre Norte', 45, 4.2, 52, 'Sempre limpo',
   63.5, 41.6, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   true, 'Bom', 'Excelente', '1 hora atrás'),

  ('minas_1', 'Casa de banho de Minas 1', 'Edifício de Minas', 100, 4.1, 22, 'Sempre limpo',
   64.6, 71.6, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('accao_social_1', 'Casa de banho de Ação Social 1', 'Pavilhão de Ação Social', 85, 4.1, 28, 'Sempre limpo',
   74.9, 71.7, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('informatica_i_-1', 'Casa de banho de Informática I', 'Pavilhão de Informática I', 150, 4.1, 28, 'Sempre limpo',
   74.2, 35.2, '-1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('minas_2', 'Casa de banho de Minas 2', 'Edifício de Minas', 105, 4.0, 18, 'Sempre limpo',
   67.1, 70.8, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('minas_4', 'Casa de banho de Minas 4', 'Edifício de Minas', 115, 4.0, 14, 'Sempre limpo',
   70.9, 69.5, '4', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '3 horas atrás'),

  ('accao_social_3', 'Casa de banho de Ação Social 3', 'Pavilhão de Ação Social', 90, 4.0, 20, 'Sempre limpo',
   76.3, 70.7, '3', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '3 horas atrás'),

  ('informatica_i_0', 'Casa de banho de Informática I Piso 0', 'Pavilhão de Informática I', 152, 4.0, 35, 'Sempre limpo',
   72.8, 34.8, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('informatica_iii_0', 'Casa de banho de Informática III', 'Pavilhão de Mecânica II', 165, 4.0, 22, 'Sempre limpo',
   77.7, 39.4, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('quimica_1', 'Casa de banho Gabinetes', 'Pavilhão de Química', 180, 4.0, 15, 'Sempre limpo',
   65.5, 63.0, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Excelente', '2 horas atrás'),

  ('torre_norte_-1', 'Casa de banho da Torre Norte', 'Torre Norte', 50, 4.0, 45, 'Sempre limpo',
   63.0, 39.1, '-1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('minas_3', 'Casa de banho de Minas 3', 'Edifício de Minas', 110, 3.9, 20, 'Geralmente limpo',
   62.2, 70.6, '3', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '4 horas atrás'),

  ('informatica_i_2', 'Casa de banho de Informática I Piso 2', 'Pavilhão de Informática I', 158, 3.9, 25, 'Geralmente limpo',
   73.5, 34.6, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '3 horas atrás'),

  ('mecanica_ii_0', 'Casa de banho de Mecânica II', 'Pavilhão de Mecânica II', 210, 3.9, 22, 'Geralmente limpo',
   82.1, 43.6, '0', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '3 horas atrás'),

  ('torre_norte_1', 'Casa de banho da Torre Norte 1', 'Torre Norte', 55, 3.9, 35, 'Geralmente limpo',
   61.9, 42.0, '1', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '3 horas atrás'),

  ('torre_norte_6', 'Casa de banho da Torre Norte 6', 'Torre Norte', 62, 3.9, 22, 'Geralmente limpo',
   60.6, 39.4, '6', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '3 horas atrás'),

  ('civil_-2', 'Casa de banho de Civil', 'Edifício de Civil', 120, 3.8, 15, 'Geralmente limpo',
   39.6, 42.9, '-2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '3 horas atrás'),

  ('informatica_iii_2', 'Casa de banho de Informática III Piso 2', 'Pavilhão de Informática III', 168, 3.8, 15, 'Geralmente limpo',
   78.4, 40.3, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Média', '4 horas atrás'),

  ('mecanica_i_2', 'Casa de banho de Mecânica I Piso 2', 'Pavilhão de Mecânica I', 205, 3.8, 20, 'Geralmente limpo',
   60.6, 44.3, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Média', '4 horas atrás'),

  ('mecanica_ii_2', 'Casa de banho de Mecânica II Piso 2', 'Pavilhão de Mecânica II', 215, 3.8, 16, 'Geralmente limpo',
   80.4, 43.4, '2', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '3 horas atrás'),

  ('torre_norte_4', 'Casa de banho da Torre Norte 4', 'Torre Norte', 58, 3.8, 28, 'Geralmente limpo',
   64.8, 41.7, '4', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '3 horas atrás'),

  ('torre_norte_8', 'Casa de banho da Torre Norte 8', 'Torre Norte', 67, 3.8, 20, 'Geralmente limpo',
   62.0, 37.0, '8', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Boa', '3 horas atrás'),

  ('mecanica_i_1', 'Casa de banho de Mecânica I', 'Pavilhão de Mecânica I', 200, 3.7, 25, 'Geralmente limpo',
   62.2, 45.0, '1', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Média', '4 horas atrás'),

  ('mecanica_ii_1', 'Casa de banho de Mecânica II Piso 1', 'Pavilhão de Mecânica II', 212, 3.7, 19, 'Geralmente limpo',
   79.0, 44.0, '1', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Média', '4 horas atrás'),

  ('mecanica_iv_1', 'Casa de banho de Mecânica IV Piso 1', 'Pavilhão de Mecânica IV', 222, 3.7, 12, 'Geralmente limpo',
   73.7, 41.7, '1', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Média', '4 horas atrás'),

  ('torre_norte_5', 'Casa de banho da Torre Norte 5', 'Torre Norte', 60, 3.7, 25, 'Geralmente limpo',
   63.0, 41.5, '5', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Média', '4 horas atrás'),

  ('torre_norte_9', 'Casa de banho da Torre Norte 9', 'Torre Norte', 70, 3.7, 15, 'Geralmente limpo',
   63.8, 40.5, '9', ARRAY['Papel higiénico', 'Sabão', 'Espelho'],
   false, 'Médio', 'Média', '4 horas atrás'),

  ('mecanica_i_3', 'Casa de banho de Mecânica I Piso 3', 'Pavilhão de Mecânica I', 208, 3.6, 18, 'Às vezes limpo',
   68.1, 42.9, '3', ARRAY['Papel higiénico', 'Sabão'],
   false, 'Fraco', 'Média', '5 horas atrás'),

  ('mecanica_iv_0', 'Casa de banho de Mecânica IV', 'Pavilhão de Mecânica IV', 220, 3.6, 14, 'Às vezes limpo',
   72.7, 41.2, '0', ARRAY['Papel higiénico', 'Sabão'],
   false, 'Fraco', 'Média', '5 horas atrás'),

  ('torre_norte_7', 'Casa de banho da Torre Norte 7', 'Torre Norte', 65, 3.6, 18, 'Às vezes limpo',
   61.3, 41.5, '7', ARRAY['Papel higiénico', 'Sabão'],
   false, 'Fraco', 'Média', '5 horas atrás'),

  ('torre_norte_11', 'Casa de banho da Torre Norte 11', 'Torre Norte', 75, 3.6, 10, 'Às vezes limpo',
   62.3, 40.9, '11', ARRAY['Papel higiénico', 'Sabão'],
   false, 'Fraco', 'Média', '6 horas atrás'),

  ('mecanica_iv_2', 'Casa de banho de Mecânica IV Piso 2', 'Pavilhão de Mecânica IV', 225, 3.5, 10, 'Às vezes limpo',
   73.1, 39.9, '2', ARRAY['Papel higiénico', 'Sabão'],
   false, 'Fraco', 'Média', '6 horas atrás'),

  ('torre_norte_10', 'Casa de banho da Torre Norte 10', 'Torre Norte', 72, 3.5, 12, 'Às vezes limpo',
   63.8, 41.2, '10', ARRAY['Papel higiénico', 'Sabão'],
   false, 'Fraco', 'Média', '5 horas atrás'),

  ('pavilhao_central_-1', 'Casa de banho do Pavilhão Central Piso -1', 'Pavilhão Central', 62, 4.0, 0, 'Geralmente limpo',
   52.4, 51.8, '-1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Médio', 'Boa', '2 horas atrás'),

  ('pavilhao_central_0', 'Casa de banho do Pavilhão Central', 'Pavilhão Central', 60, 4.1, 0, 'Sempre limpo',
   52.0, 52.0, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   false, 'Bom', 'Boa', '1 hora atrás'),

  ('matematica_0', 'Casa de banho do Pavilhão de Matemática', 'Pavilhão de Matemática', 140, 4.0, 0, 'Sempre limpo',
   41.0, 66.9, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('matematica_1', 'Casa de banho do Pavilhão de Matemática Piso 1', 'Pavilhão de Matemática', 140, 4.0, 0, 'Sempre limpo',
   41.0, 63.9, '1', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho'],
   false, 'Bom', 'Boa', '2 horas atrás'),

  ('fisica_0', 'Casa de banho do Pavilhão de Física', 'Pavilhão de Física', 130, 4.1, 0, 'Sempre limpo',
   44.9, 75.1, '0', ARRAY['Papel higiénico', 'Sabão', 'Toalhas de papel', 'Espelho', 'Secador de mãos'],
   true, 'Bom', 'Excelente', '1 hora atrás');

-- Insert some sample reviews for the Torre Norte bathroom
INSERT INTO reviews (bathroom_id, user_name, rating, comment, date, cleanliness, paper_supply, privacy) VALUES
  ('torre_norte_0', 'João Silva', 4, 'Sempre limpo e bem equipado. Boa localização no centro do campus.', '2024-12-15', 4, 4, 4);