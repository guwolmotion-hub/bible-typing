export function keyCount(text) {
  // Compound vowels/final consonants require two physical keys in Korean two-set layout.
  const vowels = new Set([9,10,11,14,15,16,19]);
  const finals = new Set([3,5,6,9,10,11,12,13,14,15,18]);
  return [...text].reduce((n,ch)=>{
    const c=ch.codePointAt(0)-0xac00;
    if(c<0||c>11171)return n+1;
    const vowel=Math.floor(c/28)%21, final=c%28;
    return n+1+(vowels.has(vowel)?2:1)+(final?(finals.has(final)?2:1):0);
  },0);
}
export function changedInput(previous,value,target){
  let start=0;
  while(start<previous.length&&start<value.length&&previous[start]===value[start])start++;
  let endOld=previous.length,endNew=value.length;
  while(endOld>start&&endNew>start&&previous[endOld-1]===value[endNew-1]){endOld--;endNew--;}
  let correct=0;
  for(let i=start;i<endNew;i++)if(value[i]===target[i])correct++;
  return {attempts:endNew-start,correct};
}
export function localDay(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function dailyIndex(day,length){return [...day].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,0)%length;}
export function clock(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;}
