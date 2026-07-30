// Menú de temporada: platillos ilustrativos aprobados por Armando hasta tener el menú real de Pollo.
export type Categoria = 'Platillos' | 'Bebidas' | 'Postres';

export const MENU: { categoria: Categoria; nombre: string; descripcion: string }[] = [
  { categoria: 'Platillos', nombre: 'Hamburguesa del Vikingo', descripcion: 'Doble carne, queso fundido y cebolla caramelizada. Digna de un salón de guerreros.' },
  { categoria: 'Platillos', nombre: 'Hot Dog del Aventurero', descripcion: 'Salchicha jumbo con tocino, para reponer fuerzas entre mazmorras.' },
  { categoria: 'Platillos', nombre: 'Alitas del Dragón', descripcion: 'Bañadas en salsa de fuego. Solo para valientes con constitución alta.' },
  { categoria: 'Platillos', nombre: 'Nachos de la Cripta', descripcion: 'Montaña de totopos con queso, frijol y jalapeño. Botín para compartir.' },
  { categoria: 'Bebidas', nombre: 'Hidromiel de la Posada', descripcion: 'Nuestra bebida insignia de miel especiada, servida en tarro.' },
  { categoria: 'Bebidas', nombre: 'Elixir del Mago', descripcion: 'Limonada mística de temporada que restaura puntos de maná.' },
  { categoria: 'Bebidas', nombre: 'Café del Cronista', descripcion: 'De olla, para las sesiones que se alargan hasta la madrugada.' },
  { categoria: 'Postres', nombre: 'Brownie de la Mazmorra', descripcion: 'Oscuro, denso y con tesoro de nuez adentro. La recompensa final.' },
];

export const CATEGORIAS: Categoria[] = ['Platillos', 'Bebidas', 'Postres'];
