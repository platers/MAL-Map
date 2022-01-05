import {getIdFromLink, getRecs} from './utils';
import * as _ from 'lodash';

test('Get recs witch hunter', async () => {
    const recs = await getRecs(7);
    expect(recs[2025]).toBeGreaterThan(7);
    const vals = _.values(recs);
    expect(_.min(vals)).toBeGreaterThan(0);
    expect(vals.length).toBeGreaterThan(20);
});

test('Get recs full metal panic', async () => {
    const recs = await getRecs(72);
    expect(recs[24]).toBeGreaterThan(2);
    const vals = _.values(recs);
    expect(_.min(vals)).toBeGreaterThan(0);
});
test('Get id from url', () => {
    expect(getIdFromLink('https://myanimelist.net/anime/7/Witch_Hunter_Robin/')).toBe(7);
});