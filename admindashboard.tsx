import React from 'React';

const AdminDashboard = () => {
  // Datos para las estadísticas
  const stats = [
    {
      id: 1,
      title: 'Usuarios registrados',
      value: '1,842',   
      description: '+125 nuevos esta semana (↑7.2%)'
    },
    {
      id: 2,
      title: 'Intercambios realizados',
      value: '4,317',
      description: '15% más que el mes anterior'
    },
    {
      id: 3,
      title: 'Habilidades únicas',
      value: '189',
      description: '23 nuevas habilidades este mes'
    }
  ];

  // Datos para los testimonios
  const testimonials = [
    {
      id: 1,
      text: 'Esta plataforma ha cambiado mi vida profesional. He aprendido tanto y he hecho conexiones valiosas que nunca imaginé posibles desde mi hogar.',
      author: 'John Doe'
    },
    {
      id: 2,
      text: 'Fui capaz de conocer a personas increíbles y ayudar a quienes necesitaban mis habilidades. ¡Una experiencia que superó todas mis expectativas!',
      author: 'Ana Smith'
    },
    {
      id: 3,
      text: 'La propuesta de intercambiar habilidades es la innovación que necesitábamos en el mercado. He mejorado mis habilidades mientras ayudo a otros.',
      author: 'Carlos Pérez'
    }
  ];

  // Habilidades destacadas
  const skills = [
    'Desarrollo Web',
    'Diseño UX/UI',
    'Inglés Avanzado',
    'Marketing Digital',
    'Fotografía Profesional',
    'Cocina Internacional',
    'Edición de Video',
    'Copywriting',
    'Data Science',
    'Ilustración Digital',
    'Francés Intermedio',
    'SEO Avanzado'
  ];

  // Items del menú lateral
  const menuItems = [
    { id: 1, label: 'Dashboard' },
    { id: 2, label: 'Usuarios' },
    { id: 3, label: 'Habilidades' },
    { id: 4, label: 'Intercambios' },
    { id: 5, label: 'Mensajes' },
    { id: