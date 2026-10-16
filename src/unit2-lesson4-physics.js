function positive(x,name){if(!Number.isFinite(x)||x<=0)throw new RangeError(`${name} must be positive`);return x;}
export function ohmCurrent(u,r){if(!Number.isFinite(u)||u<0)throw new RangeError('voltage must be non-negative');return u/positive(r,'resistance');}
export function wireResistance(rho,length,area){return positive(rho,'rho')*positive(length,'length')/positive(area,'area');}
export function squareCentimetresToMetres(area){return positive(area,'area')*1e-4;}
export function equivalentResistance(resistors,mode){if(!Array.isArray(resistors)||!resistors.length)throw new RangeError('resistors required');resistors.forEach(r=>positive(r,'resistance'));if(mode==='series')return resistors.reduce((a,b)=>a+b,0);if(mode==='parallel')return 1/resistors.reduce((a,b)=>a+1/b,0);throw new RangeError('unknown mode');}
export function network(u,r1,r2,mode){const r=equivalentResistance([r1,r2],mode);const i=ohmCurrent(u,r);return {r,i,i1:mode==='series'?i:ohmCurrent(u,r1),i2:mode==='series'?i:ohmCurrent(u,r2),u1:mode==='series'?i*r1:u,u2:mode==='series'?i*r2:u};}
export function colourResistance(a,b,c){if(![a,b,c].every(v=>Number.isInteger(v)&&v>=0&&v<=9))throw new RangeError('colour digits required');return (10*a+b)*10**c;}
export function graphSlope(a,b){if(b.i===a.i)throw new RangeError('vertical line');return (b.u-a.u)/(b.i-a.i);}
