export const ELEMENTARY_CHARGE = 1.6e-19;
export const COULOMB_CONSTANT = 9e9;
const pos=(v,n)=>{const x=Number(v);if(!Number.isFinite(x)||x<=0)throw new RangeError(`${n} must be positive.`);return x;};
const finite=(v,n)=>{const x=Number(v);if(!Number.isFinite(x))throw new RangeError(`${n} must be finite.`);return x;};
/** q = n·e with sign: lost electrons -> positive, gained -> negative. n is count. */
export function chargeFromElectrons(count, mode){
  const n=pos(count,'electron count'); if(!['lost','gained'].includes(mode)) throw new RangeError('mode must be lost or gained.');
  const magnitude=n*ELEMENTARY_CHARGE; return {count:n, charge: mode==='lost'?magnitude:-magnitude, sign: mode==='lost'?1:-1, magnitude};
}
export function electronCountFromCharge(chargeC){
  const q=finite(chargeC,'charge'); if(q===0) return {count:0, charge:0, sign:0};
  return {count: Math.abs(q)/ELEMENTARY_CHARGE, charge:q, sign: Math.sign(q)};
}
/** Coulomb magnitude F=K|q1 q2|/d^2 ; kind from signs. Charges in coulombs, d in metres. */
export function coulombForce(q1,q2,distanceM){
  const a=finite(q1,'q1'), b=finite(q2,'q2'), d=pos(distanceM,'distance');
  const magnitude=COULOMB_CONSTANT*Math.abs(a*b)/(d*d);
  const kind = a===0||b===0 ? 'none' : (Math.sign(a)===Math.sign(b)?'repulsion':'attraction');
  return {magnitude, kind, signedProduct:a*b};
}
export function coulombForceScaled(q1,q2,distanceM, factor){
  const base=coulombForce(q1,q2,distanceM); const f=pos(factor,'scale factor');
  return {...base, magnitude: base.magnitude*f};
}
/** Force on charge at A from two others on a line. positions in m, charges C. Returns signed net (positive = toward increasing x). */
export function netForceOnCharge(target, others){
  let net=0; const parts=others.map((o)=>{
    const dx=o.position-target.position; const dist=Math.abs(dx); const {magnitude,kind}=coulombForce(target.charge,o.charge,dist);
    // attraction pulls toward other (+dx direction), repulsion pushes away
    const direction = kind==='attraction'? Math.sign(dx) : kind==='repulsion'? -Math.sign(dx):0;
    const signed=magnitude*direction; net+=signed; return {...o, magnitude, kind, signed};
  });
  return {net, magnitude:Math.abs(net), direction: Math.sign(net), parts};
}
/** Simplified electroscope model: leaf divergence grows with |net charge|, saturates. Educational simplified model. */
export function electroscopeState(netChargeMicroC){
  const q=finite(netChargeMicroC,'net charge');
  const angle=Math.min(62, Math.abs(q)*9); // illustrative saturation, not a calibrated instrument
  return {netCharge:q, angle, diverged: Math.abs(q)>0.01, sign: Math.sign(q)};
}
