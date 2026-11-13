import type { Board, Category } from '../types/game';
import { createId } from '../utils/id';

type RawCategory = { title: string; clues: Array<[question: string, answer: string]> };

const rawCategories: RawCategory[] = [
  {
    title: 'Norsk geografi',
    clues: [
      ['Hva heter Norges hovedstad?', 'Oslo'],
      ['Hva heter Norges lengste elv?', 'Glomma'],
      ['Hva heter Norges høyeste fjell?', 'Galdhøpiggen'],
      ['Hva heter Norges største innsjø?', 'Mjøsa'],
      ['Hvilken by kalles ofte «Nordens Paris»?', 'Tromsø'],
    ],
  },
  {
    title: 'Historie',
    clues: [
      ['Hvilket år ble Norges grunnlov vedtatt?', '1814'],
      ['Hvilket år ble unionen med Sverige oppløst?', '1905'],
      ['Hvem ble konge i Norge i 1905?', 'Haakon 7.'],
      ['Hvilket år ble Norge invadert av Tyskland?', '1940'],
      ['Hvilken konge regnes for å ha samlet Norge til ett rike?', 'Harald Hårfagre'],
    ],
  },
  {
    title: 'Sport',
    clues: [
      ['Hvor mange spillere har et fotballag på banen samtidig?', '11'],
      ['Hvilken norsk by arrangerte vinter-OL i 1994?', 'Lillehammer'],
      ['Hvor langt er et maratonløp?', '42,195 km'],
      ['Hvilket land har vunnet flest medaljer totalt i vinter-OL?', 'Norge'],
      ['Hvilken norsk langrennsløper tok åtte OL-gull mellom 1992 og 1998?', 'Bjørn Dæhlie'],
    ],
  },
  {
    title: 'Vitenskap',
    clues: [
      ['Hva er den kjemiske formelen for vann?', 'H₂O'],
      ['Hvilken planet er nærmest sola?', 'Merkur'],
      ['Ved hvor mange grader Celsius koker vann ved havnivå?', '100'],
      ['Hvor mange bein har en edderkopp?', 'Åtte'],
      ['Hva er det vanligste grunnstoffet i universet?', 'Hydrogen'],
    ],
  },
  {
    title: 'Mat og drikke',
    clues: [
      ['Hva er hovedingrediensen i guacamole?', 'Avokado'],
      ['Hvilket land kommer pizzaen opprinnelig fra?', 'Italia'],
      ['Hva heter den norske nasjonalretten med lam og kål?', 'Fårikål'],
      ['Hva er lutefisk laget av?', 'Tørrfisk (som regel torsk) lagt i lut'],
      ['Hvilket krydder er verdens dyreste målt etter vekt?', 'Safran'],
    ],
  },
];

export function createSampleBoard(): Board {
  const categories: Category[] = rawCategories.map((raw) => ({
    id: createId(),
    title: raw.title,
    clues: raw.clues.map(([question, answer], index) => ({
      id: createId(),
      value: (index + 1) * 100,
      question,
      answer,
    })),
  }));

  return {
    id: createId(),
    name: 'Eksempelbrett',
    timerSeconds: 30,
    categories,
    updatedAt: new Date().toISOString(),
  };
}
