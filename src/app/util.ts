
export function naturalSort(arr:any[], key:any):any[] {
  var a, b, a1, b1, rx=/(\d+)|(\D+)/g, rd=/\d+/;
  return arr.sort((as,bs) => {
    a= String(eval('as.'+key)).toLowerCase().match(rx);
    b= String(eval('bs.'+key)).toLowerCase().match(rx);
    while(a.length && b.length){
      a1= a.shift();
      b1= b.shift();
      if(rd.test(a1) || rd.test(b1)){
        if(!rd.test(a1)) return 1;
        if(!rd.test(b1)) return -1;
        if(a1!= b1) return a1-b1;
      }
      else if(a1!= b1) return a1> b1? 1: -1;
    }
    return a.length- b.length;
  });
}
