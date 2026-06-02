// Réplique de reponseEstCorrecte pour choix_multiple / cas_pratique
function correcte(bonne, rep){ if(rep==null) return false; const r=rep.trim(); if(!r.length) return false; return r.toLowerCase()===(bonne??"").toLowerCase(); }
const SENT="__je_ne_sais_pas__";
console.log("sentinelle vs 'a':", correcte("a", SENT));      // attendu false
console.log("sentinelle vs 'b':", correcte("b", SENT));      // attendu false
console.log("bonne 'c' vs 'c':", correcte("c","c"));          // attendu true
console.log("vide:", correcte("a",""));                       // attendu false
