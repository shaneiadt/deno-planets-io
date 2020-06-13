import { BufReader } from 'https://deno.land/std/io/bufio.ts';
import { parse } from 'https://deno.land/std/encoding/csv.ts';
import * as _ from 'https://raw.githubusercontent.com/lodash/lodash/4.17.15-es/lodash.js';

interface Planet {
  [key: string]: string | number;
}

async function loadPlanetsData() {
  const file = await Deno.open('./kepler_exoplanets_nasa.csv');
  const bufReader = new BufReader(file);
  const result = await parse(bufReader, {
    header: true,
    comment: '#'
  }) as Planet[];

  Deno.close(file.rid);

  const planets: Planet[] = result.filter(({ koi_disposition, koi_prad, koi_smass, koi_srad }) =>
    koi_disposition === 'CONFIRMED'
    && koi_prad > 0.5
    && koi_prad < 1.5
    && koi_smass > 0.78
    && koi_smass < 1.04
    && koi_srad > 0.99
    && koi_srad < 1.01);

  return planets.map(planet => _.pick(planet, ['koi_prad', 'koi_smass', 'koi_srad', 'kepler_name', 'koi_count', 'koi_steff', 'koi_period']));
}

const newEarth: Planet[] = await loadPlanetsData();

const orbitalPeriod = (v: number = 0) => {
  const statement = (p: Planet, c: Planet) => v === 1
    ? Number(c['koi_period']) < Number(p['koi_period'])
    : Number(c['koi_period']) > Number(p['koi_period']);

  return newEarth.reduce((prev: Planet, cur: Planet) => statement(prev, cur) ? cur : prev, newEarth[0]);
}

console.log(`${newEarth.length} habitable planets.`);
console.log(`${orbitalPeriod()['kepler_name']} has the longest oribtal period at ${orbitalPeriod()['koi_period']}`);
console.log(`${orbitalPeriod(1)['kepler_name']} has the shortest oribtal period at ${orbitalPeriod(1)['koi_period']}`);