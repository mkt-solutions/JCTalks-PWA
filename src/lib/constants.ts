export const BIBLE_VERSES = [
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", ref: "João 3:16" },
  { text: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmos 23:1" },
  { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { text: "Não fui eu que lhe ordenei? Seja forte e corajoso! Não se apavore, nem se desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.", ref: "Josué 1:9" },
  { text: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.", ref: "1 Pedro 5:7" },
  { text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", ref: "1 Coríntios 13:4" },
  { text: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.", ref: "Mateus 6:33" },
  { text: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.", ref: "Mateus 11:28" },
  { text: "E conhecereis a verdade, e a verdade vos libertará.", ref: "João 8:32" },
  { text: "O meu mandamento é este: Amem-se uns aos outros como eu os amei.", ref: "João 15:12" }
];

export function shareMessage(text: string, platform: 'whatsapp' | 'telegram' | 'email') {
  const encodedText = encodeURIComponent(text);
  const urls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${window.location.href}&text=${encodedText}`,
    email: `mailto:?subject=Mensagem do JC Talks&body=${encodedText}`
  };
  window.open(urls[platform], '_blank');
}
