// ==========================================
// BOTLARNING O'ZIGA XOS GAPIRISH LUG'ATI
// ==========================================
const botDialogues = {
  beginner: {
    move: ["Yaxshi yurish, men esa shuni tanladim.", "Umid qilamanki bu xato emas.", "Doskadagi vaziyat qiziq bo'lyapti."],
    attack: ["Shohingizga ehtiyot bo'ling!", "Shoh berdim."],
    capture: ["Figurangizni oldim.", "Bu figura menga kerak edi."],
    win: ["Voy, men yutib qo'ydimmi? Zo'r o'yin bo'ldi!", "Rahmat o'yin uchun!"],
    loss: ["Siz juda kuchli ekansiz, yutqazdim.", "Keyingi safar albatta yutaman!"]
  },
  balanced: {
    move: ["Markazni egallaymiz.", "Mening rejam bor, qarab turing.", "Pozitsiya ancha qizg'in."],
    attack: ["Shoh! Qayerga qochasiz?", "Hujum davom etadi!"],
    capture: ["Bu dona ortiqcha edi.", "Moddiy ustunlik mening tomonimda."],
    win: ["Rejam mukammal ishladi! G'alaba!", "Mot! Yaxshi harakat qildingiz."],
    loss: ["Ajoyib kombinatsiya qildingiz, tan olaman.", "Bu safar sizniki bo'ldi."]
  },
  solid: {
    move: ["Shoshilishga hojat yo'q, hamma narsa nazorat ostida.", "Pozitsiyangizda kichik bo'shliq paydo bo'ldi.", "Asta-sekin qisish strategiyasi."],
    attack: ["Shoh. Himoyangiz zaiflashdi.", "Qochish yo'llaringiz kamaymoqda."],
    capture: ["Muhim figura bartaraf etildi.", "Strukturangiz buzildi."],
    win: ["Xatosiz pozitsion g'alaba. Mot.", "Mudofaadagi xatoingiz qimmatga tushdi."],
    loss: ["Ajoyib o'yin. Pozitsion ustunlikni boy berdim."]
  },
  aggressive: {
    move: ["Meni to'xtata olmaysiz, hujumga o'taman!", "Qurbonlik berishdan qo'rqmayman!", "Olovli shaxmat boshlandi!"],
    attack: ["Shoh! Shohingiz olov ichida qoldi!", "To'xtovsiz mot hujumi!"],
    capture: ["Donalaringiz birin-ketin qulaydi!", "Hujum yo'li ochildi!"],
    win: ["Dahshatli mot! Tal uslubi hamisha yengadi!", "G'alaba meniki!"],
    loss: ["Qoyil, mening olovli hujumimni qaytara oldingiz!"]
  },
  clone: {
    move: ["Men ham xuddi sizdek o'ylagan edim.", "Bu bizning sevimli uslubimiz.", "Chiroyli taktik yurish."],
    attack: ["Shoh! Bizning uslubimizdagi zarba!", "Shohga xavf solindi."],
    capture: ["Figurani oldik.", "Ustunlik bizda."],
    win: ["Bizning uslubimiz har doim g'olib!", "Ajoyib mot bo'ldi!"],
    loss: ["O'zimiz o'zimizdan yutqazdik, ajoyib partiya bo'ldi!"]
  }
};

function makeBotSpeak(type, moveData) {
  const personality = currentBot.personality || 'aggressive';
  const dialogueSet = botDialogues[personality] || botDialogues.aggressive;
  
  let phrases = dialogueSet[type] || dialogueSet.move;
  let phrase = phrases[Math.floor(Math.random() * phrases.length)];

  // Agar aniq yurish bo'lsa katagini ham qo'shib gapiradi
  if (moveData && moveData.to && type === 'move') {
    phrase = `${moveData.to}. ${phrase}`;
  }

  speakUzbekAi(phrase);
}
