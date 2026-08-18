/* ============================================================
   ULLAS BIRTHDAY APP — single controller, one source of truth
   for every scene transition.
============================================================ */

function show(id){
  document.querySelectorAll('.scene').forEach(section => section.classList.remove('active'));
  const target = document.getElementById(id);
  if(target) target.classList.add('active');
}

const fan = document.getElementById('fan');
const song = document.getElementById('song');
const carAudio2 = document.getElementById('carAudio2');
const darlingAudio = document.getElementById('darlingAudio');
const loverboyAudio = document.getElementById('loverboyAudio');
let activeBlurryAudio = null;

function stopAllAudio(){
  [fan, song, carAudio2, darlingAudio, loverboyAudio].forEach(a => { a.pause(); a.currentTime = 0; });
  if(activeBlurryAudio){ activeBlurryAudio.pause(); activeBlurryAudio.currentTime = 0; activeBlurryAudio = null; }
  const carVideo1 = document.getElementById('carVideo1');
  const carVideo2 = document.getElementById('carVideo2');
  if(carVideo1) carVideo1.pause();
  if(carVideo2) carVideo2.pause();
}

/* ---------- 1. OPENING ---------- */
const yes = document.getElementById('yes');
const no = document.getElementById('no');
const yesNo = document.getElementById('yesNo');
let escapes = 0;

no.addEventListener('click', () => {
  no.classList.add('red');
  setTimeout(() => no.classList.remove('red'), 500);
});

function moveYesAway(){
  if(!document.getElementById('opening').classList.contains('active')) return;
  if(escapes >= 4) return;
  escapes++;
  const box = yesNo.getBoundingClientRect();
  yes.style.transform = `translate(${(Math.random()-.5)*Math.max(55,box.width-130)}px,${(Math.random()-.5)*70}px)`;
  if(escapes >= 4){
    setTimeout(() => {
      yes.style.transform = '';
      escapes = 0;
      show('verification');
    }, 150);
  }
}
yes.addEventListener('click', moveYesAway);

/* ---------- 2. VERIFICATION ---------- */
document.querySelectorAll('#verification .choice').forEach(button => {
  button.addEventListener('click', () => show('pie'));
});

/* ---------- 3. PIE QUESTION ---------- */
const pieInput = document.getElementById('pieInput');
const pieSubmit = document.getElementById('pieSubmit');
const pieFeedback = document.getElementById('pieFeedback');
const dots = document.getElementById('dots');
const CORRECT_ANSWER = '2.17';
let pieAttempts = 0;

for(let i = 0; i < 4; i++) dots.insertAdjacentHTML('beforeend', '<i></i>');

function checkPie(){
  if(pieInput.value.trim() === CORRECT_ANSWER){
    pieFeedback.textContent = 'Correct 😂';
    setTimeout(() => show('double'), 450);
    return;
  }
  if(pieAttempts < 4){
    dots.children[pieAttempts].classList.add('used');
    pieAttempts++;
  }
  if(pieAttempts >= 4){
    pieFeedback.textContent = `The answer is ${CORRECT_ANSWER} 😂`;
    pieSubmit.disabled = true;
    setTimeout(() => show('double'), 1400);
  } else {
    pieFeedback.textContent = 'Hint: nenpskolo lwde';
    pieInput.value = '';
    pieInput.focus();
  }
}
pieSubmit.addEventListener('click', checkPie);
pieInput.addEventListener('keydown', event => { if(event.key === 'Enter') checkPie(); });

/* ---------- 4. DOUBLE VERIFICATION ---------- */
document.querySelectorAll('#double .double').forEach(button => {
  button.addEventListener('click', () => {
    if(button.classList.contains('correct')){
      button.classList.add('right');
      setTimeout(() => show('invitation'), 650);
    } else {
      button.classList.add('wrong');
      setTimeout(() => button.classList.remove('wrong'), 550);
    }
  });
});

/* ---------- 5. INVITATION ---------- */
document.getElementById('toPull').addEventListener('click', () => show('pull'));

/* ---------- 6. PULL TO REVEAL ---------- */
const pull = document.getElementById('pull');
const handle = document.getElementById('handle');
const pullPhoto = document.getElementById('pullPhoto');
const pullNote = document.getElementById('pullNote');

let dragging = false, pullComplete = false, autoRevealing = false, lastDragProgress = 0;

function resetPull(){
  pullPhoto.style.transition = 'none';
  pullPhoto.style.transform = 'translateY(105%)';
  handle.style.transform = 'translateX(-50%)';
  fan.pause(); fan.currentTime = 0;
}

function startGoodMemoriesSong(){
  song.currentTime = 0;
  song.volume = 1;
  song.play().catch(() => {});
}

function finishPull(){
  if(pullComplete) return;
  pullComplete = true;
  dragging = false;
  autoRevealing = false;
  pullPhoto.style.transition = 'transform .3s ease';
  pullPhoto.style.transform = 'translateY(0)';
  handle.style.opacity = '0';
  handle.style.pointerEvents = 'none';
  pullNote.style.opacity = '0';
  fan.pause(); fan.currentTime = 0;
  startGoodMemoriesSong();
  setTimeout(() => {
    show('memories');
    renderMemory(0);
  }, 1400);
}

function completeReveal(durationSeconds){
  autoRevealing = true;
  handle.style.pointerEvents = 'none';
  pullNote.textContent = 'Enjoy the full picture';
  fan.currentTime = 0; fan.volume = 1; fan.play().catch(() => {});
  pullPhoto.style.transition = `transform ${durationSeconds}s cubic-bezier(.22,.8,.25,1)`;
  pullPhoto.style.transform = 'translateY(0)';
  handle.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(finishPull, durationSeconds * 1000);
}

function setPull(clientY){
  const rect = pull.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (rect.bottom - clientY) / (rect.height * .55)));
  lastDragProgress = progress;
  pullPhoto.style.transition = 'none';
  pullPhoto.style.transform = `translateY(${105 - progress * 105}%)`;
  handle.style.transform = `translateX(-50%) translateY(${(1 - progress) * 32}px)`;
  if(progress >= .8) finishPull();
}

handle.addEventListener('pointerdown', event => {
  if(pullComplete || autoRevealing) return;
  dragging = true;
  lastDragProgress = 0;
  handle.setPointerCapture(event.pointerId);
  fan.currentTime = 0; fan.volume = 1; fan.play().catch(() => {});
});
handle.addEventListener('pointermove', event => { if(dragging) setPull(event.clientY); });
handle.addEventListener('pointerup', () => {
  if(!dragging || pullComplete) return;
  dragging = false;
  if(lastDragProgress >= .2){
    completeReveal(1);
  } else {
    resetPull();
  }
});
handle.addEventListener('pointercancel', () => { if(dragging && !pullComplete){ dragging = false; resetPull(); } });

handle.addEventListener('click', () => {
  if(pullComplete || autoRevealing || dragging || lastDragProgress > 0) return;
  pullPhoto.style.transition = 'none';
  pullPhoto.style.transform = 'translateY(105%)';
  void pullPhoto.offsetHeight;
  completeReveal(3.8);
});

/* ---------- 7. GOOD MEMORIES SLIDESHOW ---------- */
const memories = [
  {type:'image', media:'images/memory01.jpeg', caption:'Memory 01'},
  {type:'image', media:'images/memory02.jpeg', caption:'Memory 02'},
  {type:'image', media:'images/memory03.jpeg', caption:'Memory 03'},
  {type:'video', media:'videos/memory04.mp4',  caption:'Memory 04'},
  {type:'image', media:'images/memory05.jpeg', caption:'Memory 05'},
  {type:'image', media:'images/memory06.jpeg', caption:'Memory 06'},
  {type:'video', media:'videos/memory07.mp4',  caption:'Memory 07'},
  {type:'image', media:'images/memory08.jpeg', caption:'Memory 08'},
  {type:'image', media:'images/memory09.jpeg', caption:'Memory 09'},
  {type:'image', media:'images/memory10.jpeg', caption:'Memory 10'},
  {type:'image', media:'images/memory11.jpeg', caption:'Memory 11'},
  {type:'image', media:'images/memory12.jpeg', caption:'Memory 12'}
];

const slide = document.getElementById('slide');
const slideCaption = document.getElementById('slideCaption');
const slideCount = document.getElementById('slideCount');
let currentMemory = 0, memoryTimer;

/* Good Memories now hands off to the DARLING scene instead of straight to blurry */
function finishGoodMemories(){
  song.pause();
  song.currentTime = 0;
  show('darlingScene');
  darlingAudio.currentTime = 0;
  darlingAudio.play().catch(() => {});
}

function renderMemory(index){
  clearTimeout(memoryTimer);
  currentMemory = Math.max(0, Math.min(memories.length - 1, index));
  const memory = memories[currentMemory];

  slide.classList.add('change');
  setTimeout(() => {
    const media = document.createElement(memory.type === 'video' ? 'video' : 'img');
    media.src = memory.media;
    if(memory.type === 'video'){
      media.autoplay = true;
      media.muted = true;
      media.playsInline = true;
      media.addEventListener('ended', () => {
        if(currentMemory === memories.length - 1) finishGoodMemories();
        else renderMemory(currentMemory + 1);
      });
    } else {
      media.alt = memory.caption;
      if(currentMemory === memories.length - 1){
        memoryTimer = setTimeout(finishGoodMemories, 3000);
      } else {
        memoryTimer = setTimeout(() => renderMemory(currentMemory + 1), 5000);
      }
    }
    slide.replaceChildren(media);
    slideCaption.textContent = memory.caption;
    slideCount.textContent = `${String(currentMemory + 1).padStart(2,'0')} / ${memories.length}`;
    slide.classList.remove('change');
  }, 250);
}

document.getElementById('previous').addEventListener('click', () => renderMemory(currentMemory - 1));
document.getElementById('following').addEventListener('click', () => renderMemory(currentMemory + 1));

/* ---------- 7B. DARLING SPECIAL (new) ---------- */
document.getElementById('toBlurry').addEventListener('click', () => {
  darlingAudio.pause();
  darlingAudio.currentTime = 0;
  show('blurryMemories');
});

/* ---------- 8. BLURRY MEMORIES GRID ---------- */
const blurryItems = [
  {type:'image', media:'images/blurry01.jpeg'},
  {type:'image', media:'images/blurry02.jpeg'},
  {type:'image', media:'images/blurry03.jpeg'},
  {type:'image', media:'images/blurry04.jpeg'},
  {type:'video', media:'videos/blurry05.mp4', audio:'audio/bihari05.mp3'},
  {type:'image', media:'images/blurry06.jpeg', audio:'audio/fineshit06.mpeg'}
];

const blurryGrid = document.getElementById('blurryGrid');
const blurryViewer = document.getElementById('blurryViewer');
const blurryMedia = document.getElementById('blurryMedia');
const blurryClose = document.getElementById('blurryClose');
const blurryNext = document.getElementById('blurryNext');

function closeBlurryViewer(){
  const video = blurryMedia.querySelector('video');
  if(video){ video.pause(); video.currentTime = 0; }
  if(activeBlurryAudio){ activeBlurryAudio.pause(); activeBlurryAudio.currentTime = 0; activeBlurryAudio = null; }
  blurryViewer.classList.remove('open');
  blurryMedia.replaceChildren();
}

function openBlurryItem(item){
  if(activeBlurryAudio){ activeBlurryAudio.pause(); activeBlurryAudio.currentTime = 0; activeBlurryAudio = null; }
  blurryMedia.replaceChildren();
  const media = document.createElement(item.type === 'video' ? 'video' : 'img');
  media.src = item.media;
  if(item.type === 'video'){
    media.autoplay = true;
    media.muted = false;
    media.playsInline = true;
  } else {
    media.alt = 'Blurry memory';
  }
  blurryMedia.append(media);
  if(item.audio){
    activeBlurryAudio = new Audio(item.audio);
    activeBlurryAudio.play().catch(() => {});
  }
  blurryViewer.classList.add('open');
}

blurryItems.forEach((item, index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'blurry-card';
  const preview = document.createElement(item.type === 'video' ? 'video' : 'img');
  preview.src = item.media;
  if(item.type === 'video'){
    preview.muted = true;
    preview.playsInline = true;
    preview.preload = 'metadata';
  } else {
    preview.alt = 'Blurry memory';
  }
  card.append(preview);
  card.insertAdjacentHTML('beforeend', `<span>${index + 1}</span>`);
  card.addEventListener('click', () => openBlurryItem(item));
  blurryGrid.append(card);
});

blurryClose.addEventListener('click', closeBlurryViewer);
blurryViewer.addEventListener('click', event => { if(event.target === blurryViewer) closeBlurryViewer(); });

/* Blurry NEXT now hands off to the LOVERBOY scene instead of straight to cinematic */
blurryNext.addEventListener('click', () => {
  closeBlurryViewer();
  show('loverboyScene');
  loverboyAudio.currentTime = 0;
  loverboyAudio.play().catch(() => {});
});

/* ---------- 8B. LOVERBOY SPECIAL (new) ---------- */
document.getElementById('toCinematic').addEventListener('click', () => {
  loverboyAudio.pause();
  loverboyAudio.currentTime = 0;
  startCinematic();
});

/* ---------- 9. CINEMATIC VIDEOS ---------- */
const carVideo1 = document.getElementById('carVideo1');
const carVideo2 = document.getElementById('carVideo2');

let cinematicStarted = false;
let car02PlayCount = 0;

function startCinematic(){
  if(cinematicStarted) return;
  cinematicStarted = true;
  closeBlurryViewer();
  show('cinematicVideo');
  carVideo1.style.display = 'block';
  carVideo1.muted = false;
  carVideo1.currentTime = 0;
  carVideo1.play().catch(() => {});
}

carVideo1.addEventListener('ended', () => {
  carVideo1.style.display = 'none';
  carVideo2.hidden = false;
  carVideo2.style.display = 'block';
  carVideo2.muted = true;
  carVideo2.currentTime = 0;
  car02PlayCount = 0;
  carAudio2.currentTime = 0;
  carAudio2.play().catch(() => {});
  carVideo2.play().catch(() => {});
});

carVideo2.addEventListener('ended', () => {
  car02PlayCount++;
  if(car02PlayCount < 2){
    carVideo2.currentTime = 0;
    carVideo2.play().catch(() => {});
  } else {
    carAudio2.pause();
    carAudio2.currentTime = 0;
    stopAllAudio();
    show('finalMessage');
  }
});

/* ---------- 10. RESTART ---------- */
document.getElementById('restartButton').addEventListener('click', () => {
  stopAllAudio();

  escapes = 0;
  yes.style.transform = '';
  no.classList.remove('red');

  pieAttempts = 0;
  pieInput.value = '';
  pieFeedback.textContent = '';
  pieSubmit.disabled = false;
  Array.from(dots.children).forEach(dot => dot.classList.remove('used'));

  document.querySelectorAll('#double .double').forEach(b => b.classList.remove('right', 'wrong'));

  dragging = false; pullComplete = false; autoRevealing = false; lastDragProgress = 0;
  pullPhoto.style.transition = 'none';
  pullPhoto.style.transform = 'translateY(105%)';
  handle.style.transform = 'translateX(-50%)';
  handle.style.opacity = '1';
  handle.style.pointerEvents = 'auto';
  pullNote.style.opacity = '1';
  pullNote.textContent = 'Drag upwards';

  currentMemory = 0;

  closeBlurryViewer();

  cinematicStarted = false;
  car02PlayCount = 0;
  carVideo1.style.display = 'block';
  carVideo1.hidden = false;
  carVideo1.currentTime = 0;
  carVideo2.hidden = true;
  carVideo2.style.display = 'none';
  carVideo2.currentTime = 0;

  show('opening');
});

show('opening');