import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'chmod',
  category: 'conv',
  icon: 'lock',
  slug: { es: 'calculadora-chmod', en: 'chmod-calculator' },
  name: { es: 'chmod', en: 'chmod' },
  title: {
    es: 'Calculadora chmod: permisos octales y simbólicos',
    en: 'Chmod calculator: octal and symbolic permissions',
  },
  heading: {
    es: 'Calculadora chmod',
    en: 'Chmod calculator',
  },
  description: {
    es: 'Pasa permisos Unix de octal (755) a simbólico (rwxr-xr-x) y al revés, marca casillas y copia la orden chmod lista para la terminal.',
    en: 'Convert Unix permissions from octal (755) to symbolic (rwxr-xr-x) and back, tick boxes and copy the chmod command ready for the terminal.',
  },
  keywords: {
    es: ['chmod', 'permisos linux', 'chmod 755', 'chmod 644', 'rwxr-xr-x', 'permisos unix'],
    en: ['chmod', 'linux permissions', 'chmod 755', 'chmod 644', 'rwxr-xr-x', 'unix permissions'],
  },
  faq: {
    es: [
      {
        q: '¿Qué significa chmod 755?',
        a: 'Cada cifra es la suma de lectura (4), escritura (2) y ejecución (1) para el propietario, el grupo y los demás. 755 = rwx para el propietario y r-x para el grupo y los demás: es lo habitual en scripts y directorios.',
      },
      {
        q: '¿Por qué no debería usar 777?',
        a: 'Con 777 cualquier usuario del sistema puede modificar o borrar el archivo. Casi nunca hace falta: para archivos web suele bastar 644 y para directorios 755.',
      },
    ],
    en: [
      {
        q: 'What does chmod 755 mean?',
        a: 'Each digit is the sum of read (4), write (2) and execute (1) for the owner, the group and others. 755 = rwx for the owner and r-x for the group and others: the usual choice for scripts and directories.',
      },
      {
        q: 'Why should I avoid 777?',
        a: 'With 777 any user on the system can modify or delete the file. It is almost never needed: 644 is usually enough for web files and 755 for directories.',
      },
    ],
  },
  rememberInput: true,
};
