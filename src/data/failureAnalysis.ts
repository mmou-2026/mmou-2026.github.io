export type FailureCategory = 'both_wrong' | 'qwen_wrong' | 'gemini_wrong'

export type FailureAnswer = {
  letter: string
  text: string
  correct?: boolean
}

export type FailureCase = {
  id: string
  category: FailureCategory
  failureLabel: string
  video: string
  skills: string[]
  question: string
  gt: FailureAnswer
  gemini: FailureAnswer
  qwen: FailureAnswer
  sameWrong: boolean
  analysis: string
  reasoningExcerpt: string
}

export type FailureSection = {
  category: FailureCategory
  label: string
  shortLabel: string
  title: string
  description: string
  theme: 'danger' | 'warning' | 'info'
}

export type FailurePattern = {
  title: string
  description: string
}

export const failureSections: FailureSection[] = [
  {
    category: 'both_wrong',
    label: 'A. Both Models Wrong, Same Wrong Answer',
    shortLabel: 'A. Shared Failure',
    title: 'Systematic shared bias',
    description:
      'These are the strongest rebuttal examples: Gemini 2.5 Pro and Qwen3-Omni both fail and select the identical wrong answer, indicating shared biases rather than random mistakes.',
    theme: 'danger',
  },
  {
    category: 'qwen_wrong',
    label: 'B. Qwen3-Omni Wrong, Gemini 2.5 Pro Correct',
    shortLabel: 'B. Open-Source Gap',
    title: 'Capability gap in audio-visual grounding',
    description:
      'These cases show where Gemini successfully aligns audio and vision while Qwen3-Omni fabricates a plausible but incorrect story, highlighting a real open- vs closed-source gap.',
    theme: 'warning',
  },
  {
    category: 'gemini_wrong',
    label: 'C. Gemini 2.5 Pro Wrong, Qwen3-Omni Correct',
    shortLabel: 'C. Benchmark Difficulty',
    title: 'Even the strongest model still fails',
    description:
      'These cases show that MMOU remains difficult even for the best model in the evaluation, countering the idea that the benchmark is near ceiling or too easy.',
    theme: 'info',
  },
]

export const failurePatterns: FailurePattern[] = [
  {
    title: 'Audio Event Blindness',
    description:
      'Models frequently ignore or blur specific audio events, such as clinks, cuts, beeps, and pitch changes, and fall back to visually plausible narratives instead of grounded listening.',
  },
  {
    title: 'Language Priors Override Perception',
    description:
      'When dialogue provides a tempting cue, models often trust the spoken words more than what is actually visible or audible, answering according to prior expectations rather than evidence.',
  },
  {
    title: 'Hallucinated Embellishment',
    description:
      'Models often capture the rough gist of a scene but fabricate crucial details, swapping which object breaks, inflating a minor event into a dramatic one, or inventing sounds that are not present.',
  },
  {
    title: 'Shared Visual Bias',
    description:
      'Across many mutual failures, both models choose the identical wrong answer, suggesting common training biases that favor familiar visual stories over audio-grounded interpretation.',
  },
  {
    title: 'Cross-Modal Causal Disconnect',
    description:
      'When the answer depends on linking an audio event to a visual consequence, or vice versa, models frequently miss the causal chain and describe a more generic transition or action instead.',
  },
  {
    title: 'Counting Failure',
    description:
      'Discrete counting remains brittle in both modalities. Errors include undercounting glasses or people and overcounting gestures by large margins even when the question includes a precise temporal anchor.',
  },
  {
    title: 'Temporal Localization Failure',
    description:
      'Anchors like "right after X says Y" often fail to pin models to the correct instant, leading them to answer from a nearby but different subscene in the same long video.',
  },
]

export const failureCases: FailureCase[] = [
  {
    id: 'A1',
    category: 'both_wrong',
    failureLabel: 'DISTRACTOR ATTRACTION FROM SPEECH',
    video: 'jfEtKkzW9ko.mp4',
    skills: ['Needle', 'Referential Grounding', 'Counting'],
    question: `How many bison are shown when the man says "two animals in one shot"?`,
    gt: {
      letter: 'C',
      text: `One bison is shown when the man says "two animals in one shot."`,
    },
    gemini: {
      letter: 'I',
      text: `Two bison are shown when the man says "two animals in one shot."`,
      correct: false,
    },
    qwen: {
      letter: 'I',
      text: `Two bison are shown when the man says "two animals in one shot."`,
      correct: false,
    },
    sameWrong: true,
    analysis:
      `The man says "two animals in one shot" and both models answer with two bison, but only one bison is actually visible. Both systems follow the language cue instead of grounding the answer in the frame, making this a clear example of language priors overriding perception.`,
    reasoningExcerpt:
      `The most appropriate answer is (I) because the video shows two bison near the river when the man says "two animals in one shot."`,
  },
  {
    id: 'A2',
    category: 'both_wrong',
    failureLabel: 'COMPLETE EMOTIONAL MISREAD',
    video: 'iFy-RheUj9M.mp4',
    skills: ['Context', 'Needle', 'Referential Grounding'],
    question: `How does the child react when the man says "shut up"?`,
    gt: {
      letter: 'H',
      text: 'The child cowers in fear from the man.',
    },
    gemini: {
      letter: 'A',
      text: 'The child laughs happily as the man playfully tosses him through a doorway and catches him.',
      correct: false,
    },
    qwen: {
      letter: 'A',
      text: 'The child laughs happily as the man playfully tosses him through a doorway and catches him.',
      correct: false,
    },
    sameWrong: true,
    analysis:
      `Both models claim the child laughs happily, while the correct answer is that the child cowers in fear. The systems do not merely miss a nuance here; they invert the emotional meaning of the scene and default to a more common playful narrative.`,
    reasoningExcerpt:
      `The man says "Shut up!" at 02:59.
The child, who is already crying and protesting about moving to the new house, responds by bursting into even more exaggerated sobbing, flailing his arms and continuing to say "No!".

Let's evaluate the options:
(A) The child laughs happily as the man playfully tosses him through a doorway and catches him. - Incorr`,
  },
  {
    id: 'A3',
    category: 'both_wrong',
    failureLabel: 'AUDIO EVENT COUNTING',
    video: 'eKSeSX-dzso.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Needle', 'Counting'],
    question: 'How many glasses clink together after a champagne pop is heard?',
    gt: {
      letter: 'E',
      text: 'Four glasses clink together after the champagne pop is heard.',
    },
    gemini: {
      letter: 'G',
      text: 'Three glasses clink together after the champagne pop is heard.',
      correct: false,
    },
    qwen: {
      letter: 'G',
      text: 'Three glasses clink together after the champagne pop is heard.',
      correct: false,
    },
    sameWrong: true,
    analysis:
      'This is a pure audio-counting failure. Both models answer three, but the correct answer is four, showing that even simple discrete acoustic events remain unreliable for current systems.',
    reasoningExcerpt:
      `At 0:01:05, a champagne cork pops, and immediately after, three people are shown clinking their glasses together in a toast.

Therefore, three glasses clink together after the champagne pop is heard.

The final answer is $\\boxed{G}$`,
  },
  {
    id: 'A4',
    category: 'both_wrong',
    failureLabel: 'CROSS-MODAL CAUSAL REASONING',
    video: '6FvjUQQOoL0.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Inference'],
    question: 'Why did the music sharply end after the first montage?',
    gt: {
      letter: 'F',
      text: 'The music sharply ends to emphasize that the drone crashed during the montage.',
    },
    gemini: {
      letter: 'B',
      text: `The music sharply ends to transition from the montage into Casey's Q&A segment with Candace.`,
      correct: false,
    },
    qwen: {
      letter: 'B',
      text: `The music sharply ends to transition from the montage into Casey's Q&A segment with Candace.`,
      correct: false,
    },
    sameWrong: true,
    analysis:
      `Both models miss that the sharp stop in the music is tied to the drone crash and instead describe it as a routine editing transition. The visual event and audio consequence are present, but the causal link is not formed.`,
    reasoningExcerpt:
      `The music in the video does not "sharply end" after the first montage but rather fades out around the 1:02 mark. However, considering the overall structure of the vlog, this musical segment, which accompanies various scenes including the initial montage, concludes before Casey transitions into his Q&A segment with Candace, which begins around 1:24.`,
  },
  {
    id: 'A5',
    category: 'both_wrong',
    failureLabel: 'LANGUAGE PRIOR OVER AUDIO EVIDENCE',
    video: '56fJw8HUGuU.mp4',
    skills: ['General Holistic Reasoning', 'Inference', 'Comparative'],
    question: 'Why does the girl in the red shirt and plaid pants only sing in parts of the songs?',
    gt: {
      letter: 'F',
      text: 'She is singing backup vocals and harmonies rather than leading, so she only needs to sing during certain parts of the songs.',
    },
    gemini: {
      letter: 'E',
      text: 'She only sings in parts of the songs because her voice is very quiet, so she avoids singing over louder sections.',
      correct: false,
    },
    qwen: {
      letter: 'E',
      text: 'She only sings in parts of the songs because her voice is very quiet, so she avoids singing over louder sections.',
      correct: false,
    },
    sameWrong: true,
    analysis:
      `Both systems latch onto a plausible spoken explanation about having a quiet voice, but the actual answer depends on understanding her musical role in the performance. This is a failure to infer function from the audio rather than the dialogue.`,
    reasoningExcerpt:
      `The girl in the red shirt and plaid pants, PinkPantheress, is the lead singer of the band. At the beginning of the performance (0:20), she states, "This is my first time here, and I do have a very quiet voice, so if you do actually have to cough, you actually do need to leave the room. Because you won't be able to hear me over it."

This statement`,
  },
  {
    id: 'A6',
    category: 'both_wrong',
    failureLabel: 'FINE-GRAINED VISUAL DETAIL HALLUCINATION',
    video: 'yf2OIxRN2wE.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Subscene', 'Needle', 'Tacking Spurious Correlations'],
    question: `What unexpected event happens after a woman goes to jump on a trampoline and someone behind the camera says, "Ha, okay okay"?`,
    gt: {
      letter: 'J',
      text: `The woman jumps up and, when she lands, the trampoline's safety net splits apart so she falls through it and onto the ground.`,
    },
    gemini: {
      letter: 'G',
      text: 'The woman jumps on the trampoline, the mat tears open in the middle, and she drops straight down to the ground through the hole.',
      correct: false,
    },
    qwen: {
      letter: 'G',
      text: 'The woman jumps on the trampoline, the mat tears open in the middle, and she drops straight down to the ground through the hole.',
      correct: false,
    },
    sameWrong: true,
    analysis:
      `The models get the broad event right but hallucinate the key detail: they say the mat tears, while the correct answer is that the safety net splits. This is a representative close-but-fabricated visual error.`,
    reasoningExcerpt:
      `The woman jumps on the trampoline, and when she lands from a bounce, the mat of the trampoline tears open in the middle. She then drops straight down to the ground through the hole that formed.

This matches option (G): The woman jumps on the trampoline, the mat tears open in the middle, and she drops straight down to the ground through the hole.`,
  },
  {
    id: 'A7',
    category: 'both_wrong',
    failureLabel: 'MISSED MULTI-AGENT VISUAL EVENT',
    video: 'Qm_vmZHz-x4.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Needle', 'Tacking Spurious Correlations'],
    question: `What unexpectedly happens after "Scout, you better move," is said?`,
    gt: {
      letter: 'I',
      text: 'Two dogs barrel into the black dog standing at the edge of the dock, knocking the black dog into the water',
    },
    gemini: {
      letter: 'E',
      text: 'A dog suddenly launches off a quiet lakeside dock by itself, splashing into the still water and startling the man next to it',
      correct: false,
    },
    qwen: {
      letter: 'E',
      text: 'A dog suddenly launches off a quiet lakeside dock by itself, splashing into the still water and startling the man next to it',
      correct: false,
    },
    sameWrong: true,
    analysis:
      `Instead of tracking a three-dog interaction, both models collapse the scene into a simpler single-agent action. This is a recurring failure mode when the relevant visual event involves multiple actors and fast motion.`,
    reasoningExcerpt:
      `The correct answer is **(E) A dog suddenly launches off a quiet lakeside dock by itself, splashing into the still water and startling the man next to it**.

Here's why:
- At 0:13 in the video, someone says "Scout, you better move."
- Immediately after, a golden-colored dog jumps from the dock into the water.
- The man standing on the dock is startl`,
  },
  {
    id: 'A8',
    category: 'both_wrong',
    failureLabel: 'MUSIC SILENCE = SUSPENSE MISSED',
    video: 'BOBFHiyHlWk.mp4',
    skills: ['Inference', 'Context', 'Needle', 'Referential Grounding'],
    question: 'Why does the music stop playing when the man wearing a leather backpack is in the library?',
    gt: {
      letter: 'E',
      text: 'To emphasize the creaking wooden floors and show that the man is hiding from someone, building suspense and tension in the scene.',
    },
    gemini: {
      letter: 'G',
      text: 'So the distant explosion-like sound and his rushed footsteps in the library stand out more as danger closes in on him.',
      correct: false,
    },
    qwen: {
      letter: 'G',
      text: 'So the distant explosion-like sound and his rushed footsteps in the library stand out more as danger closes in on him.',
      correct: false,
    },
    sameWrong: true,
    analysis:
      `Both models invent dramatic sounds that are not the point of the scene. The actual role of the silence is to surface creaking floors and hiding behavior, which together create tension through restrained sound design rather than explicit danger cues.`,
    reasoningExcerpt:
      `The music stops abruptly at 0:43 when the man enters the library shelves. After the music cuts out, we hear subtle ambient sounds, his footsteps, and then a series of sudden, impactful "thump" sounds at 0:49, just before he is grabbed. This use of silence effectively builds suspense and makes the sounds of an approaching threat more pronounced.

Th`,
  },
  {
    id: 'A9',
    category: 'both_wrong',
    failureLabel: 'VISUAL COUNTING WITH AUDIO ANCHOR',
    video: 'oDG-oIZEGm8.mp4',
    skills: ['Context', 'Needle', 'Referential Grounding', 'Counting'],
    question: `How many people are on screen when the man in the Santa hat says "look where?"`,
    gt: {
      letter: 'G',
      text: 'There are seven people on screen.',
    },
    gemini: {
      letter: 'E',
      text: 'There are five people on screen.',
      correct: false,
    },
    qwen: {
      letter: 'E',
      text: 'There are five people on screen.',
      correct: false,
    },
    sameWrong: true,
    analysis:
      `Even with an explicit spoken anchor marking the relevant moment, both systems undercount the number of visible people. This suggests that temporal localization alone is not enough when scene parsing and counting are also required.`,
    reasoningExcerpt: `The answer is **(E) There are five people on screen.**`,
  },
  {
    id: 'A10',
    category: 'both_wrong',
    failureLabel: 'HALLUCINATED EMBELLISHMENT',
    video: 'wOzt4XTskrE.mp4',
    skills: ['Subscene', 'Context', 'Needle', 'Referential Grounding'],
    question: `What is happening in the clip where the man is yelling to "put it in reverse"?`,
    gt: {
      letter: 'B',
      text: `Snow is being blown off the upper story of a building onto the man's car.`,
    },
    gemini: {
      letter: 'C',
      text: 'A massive sheet of roof snow suddenly collapses and falls directly down onto a parked car, burying it.',
      correct: false,
    },
    qwen: {
      letter: 'C',
      text: 'A massive sheet of roof snow suddenly collapses and falls directly down onto a parked car, burying it.',
      correct: false,
    },
    sameWrong: true,
    analysis:
      `Both models exaggerate a gradual blowing event into a sudden catastrophic collapse. The answer they choose is cinematic and plausible, but it is not what the clip shows, which is why it is useful as a benchmark failure case.`,
    reasoningExcerpt:
      `The man in the car yells "put it in reverse" as a massive sheet of roof snow suddenly collapses and falls directly down onto his parked car, burying it. Therefore, the correct answer is (C).`,
  },
  {
    id: 'B1',
    category: 'qwen_wrong',
    failureLabel: 'HUMOROUS AV INFERENCE',
    video: '63Mn1_G3eWg.mp4',
    skills: ['Subscene', 'Inference', 'Context'],
    question: 'Why is the kid in the pink jacket crying?',
    gt: {
      letter: 'A',
      text: `The kid is crying because she can't grow a beard yet and really wants to.`,
    },
    gemini: {
      letter: 'A',
      text: `The kid is crying because she can't grow a beard yet and really wants to.`,
      correct: true,
    },
    qwen: {
      letter: 'F',
      text: `The kid is crying because she's frustrated about a craft with beads and rubber bands at the table.`,
      correct: false,
    },
    sameWrong: false,
    analysis:
      `Gemini tracks the absurd humor correctly, while Qwen3-Omni falls back to a more mundane explanation about crafting supplies. The gap here is not raw capacity alone; it is the ability to connect what is said to the unexpected visual-social context.`,
    reasoningExcerpt:
      `The kid in the pink jacket is crying because she expresses that she cannot grow a beard yet and really wants to.

The correct answer is **(A) The kid is crying because she can't grow a beard yet and really wants to.**`,
  },
  {
    id: 'B2',
    category: 'qwen_wrong',
    failureLabel: 'SIMPLE AUDIO-VISUAL SEQUENCE',
    video: 'juP1X5B46MA.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Context'],
    question: 'What is shown after the doorbell ring is heard?',
    gt: {
      letter: 'H',
      text: 'A dog is seen running down a set of stairs.',
    },
    gemini: {
      letter: 'H',
      text: 'A dog is seen running down a set of stairs.',
      correct: true,
    },
    qwen: {
      letter: 'G',
      text: 'A tiny white dog is shown nudging a doorstop until it falls off the step.',
      correct: false,
    },
    sameWrong: false,
    analysis:
      `This is a straightforward audio-then-visual sequence, yet Qwen3-Omni still drifts into the wrong subscene. That kind of miss is important because it shows the gap is present even on relatively simple aligned events.`,
    reasoningExcerpt:
      `The doorbell ring is heard at 04:18. Immediately after, a dog is seen running down a set of stairs.

The final answer is $\\boxed{H}$`,
  },
  {
    id: 'B3',
    category: 'qwen_wrong',
    failureLabel: 'AUDIO COUNTING (DIAL TONE)',
    video: 'vE-mcsfxLhg.mp4',
    skills: ['Counting'],
    question: `How many times is a dial tone heard while a phone is to the man's ear?`,
    gt: {
      letter: 'I',
      text: 'One time',
    },
    gemini: {
      letter: 'I',
      text: 'One time',
      correct: true,
    },
    qwen: {
      letter: 'F',
      text: 'Twice, once when he reaches voicemail and once during the later live call',
      correct: false,
    },
    sameWrong: false,
    analysis:
      `Gemini correctly detects a single dial tone. Qwen3-Omni invents a second occurrence, showing how audio-event counting errors can come from fabrication rather than mere uncertainty.`,
    reasoningExcerpt:
      `The correct answer is **(I) One time**

A dial tone is heard at 0:16 when the man attempts to call the doctor and reaches voicemail. In subsequent calls, either the receptionist or the doctor picks up directly after ringing, without a dial tone being heard.`,
  },
  {
    id: 'B4',
    category: 'qwen_wrong',
    failureLabel: 'CROSS-MODAL CAUSAL CHAIN',
    video: 'V_IoM7URHY8.mp4',
    skills: ['Subscene', 'Inference', 'Referential Grounding'],
    question: `Why does the camera get shaky during the clip where the man says "ouch, god"?`,
    gt: {
      letter: 'A',
      text: `The drone appears to hit the man right before he says "ouch, god," causing him to shake the camera.`,
    },
    gemini: {
      letter: 'A',
      text: `The drone appears to hit the man right before he says "ouch, god," causing him to shake the camera.`,
      correct: true,
    },
    qwen: {
      letter: 'J',
      text: 'The man stumbles after jumping from a tree branch, and his fall makes the handheld camera shake.',
      correct: false,
    },
    sameWrong: false,
    analysis:
      `Gemini correctly ties the pain reaction in the audio to the visual cause and the camera motion that follows. Qwen3-Omni instead constructs an unrelated stumble scenario, which makes the cross-modal reasoning gap explicit.`,
    reasoningExcerpt:
      `The correct answer is **(A) The drone appears to hit the man right before he says "ouch, god," causing him to shake the camera.**

At approximately 7:40 in the video, a drone falls and hits the ground very close to the person holding the camera. The camera operator reacts in surprise and flinches, which causes the handheld camera to shake as he exc`,
  },
  {
    id: 'B5',
    category: 'qwen_wrong',
    failureLabel: 'TEMPORAL SEQUENCE IN COMPILATION',
    video: 'UNDGBMRxvNo.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Subscene', 'Needle', 'Referential Grounding', 'Tacking Spurious Correlations'],
    question: `What happens after a dog carrying a red paper plate appears and before a woman yells, "what are you doing"?`,
    gt: {
      letter: 'F',
      text: `A person wearing a chicken costume unexpectedly yells, "cock-a-doodle-doo," after the woman in the dark blue blouse with white flowers opens the fridge door.`,
    },
    gemini: {
      letter: 'F',
      text: `A person wearing a chicken costume unexpectedly yells, "cock-a-doodle-doo," after the woman in the dark blue blouse with white flowers opens the fridge door.`,
      correct: true,
    },
    qwen: {
      letter: 'J',
      text: 'A woman opens a refrigerator while a dog jumps into another open fridge stuffed with soda bottles and curls up inside to sleep.',
      correct: false,
    },
    sameWrong: false,
    analysis:
      `This case is useful because the video is a compilation and the question uses two anchors. Gemini tracks the correct subscene chain, while Qwen3-Omni answers from a neighboring but wrong clip.`,
    reasoningExcerpt:
      `The correct answer is **(F) A person wearing a chicken costume unexpectedly yells, "cock-a-doodle-doo," after the woman in the dark blue blouse with white flowers opens the fridge door.**`,
  },
  {
    id: 'B6',
    category: 'qwen_wrong',
    failureLabel: 'PRECISE AUDIO DETAIL',
    video: '7QE5rkB3Hi0.mp4',
    skills: ['Context', 'Referential Grounding'],
    question: 'What unique sound is heard when the airport name is shown?',
    gt: {
      letter: 'A',
      text: 'Two intervals of three beeps are heard when the airport name is shown.',
    },
    gemini: {
      letter: 'A',
      text: 'Two intervals of three beeps are heard when the airport name is shown.',
      correct: true,
    },
    qwen: {
      letter: 'E',
      text: 'A single, clear electronic notification chime is heard when the airport name is shown.',
      correct: false,
    },
    sameWrong: false,
    analysis:
      `Qwen3-Omni compresses a structured audio pattern into a generic notification sound. Gemini's correct answer shows that the task is solvable, but only with more faithful auditory perception.`,
    reasoningExcerpt:
      `The correct answer is **(A) Two intervals of three beeps are heard when the airport name is shown.**

The airport name "SABA (TNCS) AIRPORT" appears at the 0:02 mark. At this exact moment, a distinct sound of two sets of three beeps is heard.`,
  },
  {
    id: 'B7',
    category: 'qwen_wrong',
    failureLabel: 'ZERO vs THREE FACES',
    video: 'GC64uBawYFc.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Context', 'Needle', 'Counting'],
    question: `After the speaker says, "ooh I'm so excited, I've never been on a plane," how many faces are visible of passengers that are seated on the blue seats?`,
    gt: {
      letter: 'A',
      text: 'Zero faces are visible of passengers seated on the blue seats.',
    },
    gemini: {
      letter: 'A',
      text: 'Zero faces are visible of passengers seated on the blue seats.',
      correct: true,
    },
    qwen: {
      letter: 'E',
      text: 'Three faces are visible of passengers seated on the blue seats when the camera shows the windows.',
      correct: false,
    },
    sameWrong: false,
    analysis:
      `Qwen3-Omni hallucinates three visible faces where none are actually identifiable. This is a strong example of confident visual fabrication on a counting question with a crisp anchor.`,
    reasoningExcerpt:
      `The speaker says "ooh I'm so excited, I've never been on a plane" at approximately 0:34 in the video. Immediately after this, the video shows the interior of an airplane cabin. The camera moves down the aisle, showing rows of blue seats. While there are blurry figures indicating passengers, no distinct faces are clearly visible of passengers seated`,
  },
  {
    id: 'B8',
    category: 'qwen_wrong',
    failureLabel: 'GAME EVENT IDENTIFICATION',
    video: '5qB5FoXhfAU.mp4',
    skills: ['Subscene', 'Inference', 'Context'],
    question: `Why does the announcer say "Oh my goodness"?`,
    gt: {
      letter: 'B',
      text: 'He says it because the green-haired character kicks back a bomb that the other character threw, causing that character to fly off the map from his own attack.',
    },
    gemini: {
      letter: 'B',
      text: 'He says it because the green-haired character kicks back a bomb that the other character threw, causing that character to fly off the map from his own attack.',
      correct: true,
    },
    qwen: {
      letter: 'H',
      text: `He says it as Link connects a huge aerial that launches Atreus's character off the waterfall stage at 117%.`,
      correct: false,
    },
    sameWrong: false,
    analysis:
      `Gemini identifies the actual game event that triggers the announcer reaction. Qwen3-Omni substitutes a different character and action entirely, underscoring how easily multimodal inference can drift without tight grounding.`,
    reasoningExcerpt:
      `The announcer says "Oh my goodness" because the green-haired character (Palutena) reflects a bomb thrown by the other character (Link), causing Link to be hit by his own bomb and sent flying off the map, resulting in a KO.

The final answer is $\\boxed{B}$`,
  },
  {
    id: 'B9',
    category: 'qwen_wrong',
    failureLabel: 'AUDIENCE REACTION TO VISUAL EVENT',
    video: 'T4RII4MEpAs.mp4',
    skills: ['Inference', 'Context', 'Referential Grounding'],
    question: 'Why does the audience laugh?',
    gt: {
      letter: 'A',
      text: 'The man in white uses a strange underhand serve that looks odd and not very intimidating, which makes the audience laugh.',
    },
    gemini: {
      letter: 'A',
      text: 'The man in white uses a strange underhand serve that looks odd and not very intimidating, which makes the audience laugh.',
      correct: true,
    },
    qwen: {
      letter: 'D',
      text: 'The audience laughs after a commentator jokingly says, "You’ve got to be ready for that at some point in a Bublik match," following one of Bublik’s unpredictable plays.',
      correct: false,
    },
    sameWrong: false,
    analysis:
      `The answer depends on attributing the laughter to the visual event on court rather than to commentary. Gemini grounds that causal source correctly; Qwen3-Omni shifts the cause to language instead.`,
    reasoningExcerpt:
      `The audience laughs because at 0:37, the player in white, Alexander Bublik, executes a highly unusual and unexpected underhand serve, barely flicking the ball over the net. This unorthodox play catches his opponent completely off guard and results in an ace. The surprising and amusing nature of the serve itself, combined with the opponent's stunned`,
  },
  {
    id: 'B10',
    category: 'qwen_wrong',
    failureLabel: 'VISUAL DETAIL ACCURACY',
    video: 'Z81ysQ3Y0rQ.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Subscene', 'Context', 'Needle'],
    question: `What is shown after the boy says "Can I open my eyes now"`,
    gt: {
      letter: 'D',
      text: 'A minivan with a white bow on top',
    },
    gemini: {
      letter: 'D',
      text: 'A minivan with a white bow on top',
      correct: true,
    },
    qwen: {
      letter: 'F',
      text: 'A silver minivan parked in the driveway with the family gathered around it',
      correct: false,
    },
    sameWrong: false,
    analysis:
      `Qwen3-Omni captures the rough scene but misses the white bow, which is the key visual detail that makes the answer correct. That kind of omission matters because many MMOU items hinge on exactly this level of specificity.`,
    reasoningExcerpt:
      `The answer is **(D) A minivan with a white bow on top**

**Explanation:**
The boy asks "Can I open my eyes now?" at 0:04. The immediate next shot at 0:05 shows a silver minivan with a large white bow on its roof, parked in a driveway.`,
  },
  {
    id: 'C1',
    category: 'gemini_wrong',
    failureLabel: 'AUDIO PERCEPTION: PITCH CHANGE',
    video: '2QbDh76mzCg.mp4',
    skills: ['Needle', 'Referential Grounding', 'Object Interaction Reasoning'],
    question: 'When a red saw is running, how and why does the pitch of the noise it makes change?',
    gt: {
      letter: 'E',
      text: 'It shifts to a higher pitch because it starts shaving off pieces of wood.',
    },
    gemini: {
      letter: 'A',
      text: 'Its pitch stays mostly the same, but the volume decreases when the board clears the blade.',
      correct: false,
    },
    qwen: {
      letter: 'E',
      text: 'It shifts to a higher pitch because it starts shaving off pieces of wood.',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `Gemini misperceives a clear pitch change and describes only a volume shift, while Qwen3-Omni gets the acoustic detail right. The case is valuable because it shows that even the strongest model still fails basic audio discrimination.`,
    reasoningExcerpt:
      `The user is asking about the sound of the red saw in the video and how its pitch changes. Let's analyze the relevant clips.

At 0:08, there's a distinct sound of a hand saw cutting wood, and the pitch remains relatively constant.

At 1:11, we see a miter saw in action. Its sound is mostly consistent, but it doesn't align with the "red saw" that has`,
  },
  {
    id: 'C2',
    category: 'gemini_wrong',
    failureLabel: 'AUDIO CHANGE: CUTS vs FADES',
    video: '5qa2wvn1pGY.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Comparative'],
    question: 'How does the music change right after video cuts to the dog?',
    gt: {
      letter: 'F',
      text: 'The music cuts out completely when the dog is shown.',
    },
    gemini: {
      letter: 'A',
      text: 'The music briefly fades lower but continues playing softly when the dog is shown.',
      correct: false,
    },
    qwen: {
      letter: 'F',
      text: 'The music cuts out completely when the dog is shown.',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `The distinction between an abrupt cut and a fade is simple but meaningful. Gemini misses it, while Qwen3-Omni answers correctly, which helps demonstrate that MMOU is not capped by one dominant model.`,
    reasoningExcerpt:
      `The correct answer is **(A) The music briefly fades lower but continues playing softly when the dog is shown.**`,
  },
  {
    id: 'C3',
    category: 'gemini_wrong',
    failureLabel: 'COLOR + AUDIO SYNCHRONIZATION',
    video: 'i5gbWhRW_ZA.mp4',
    skills: ['Inference', 'Context', 'Referential Grounding'],
    question: `How does the flame character's laugh match its color change?`,
    gt: {
      letter: 'F',
      text: 'The flame character turns from blue to red as it lets out a mischievous laugh, with the color shift and laugh together symbolizing its change from mellow to mischievous.',
    },
    gemini: {
      letter: 'A',
      text: 'The flame character turns from green to yellow while it giggles shyly, indicating it is becoming more cheerful.',
      correct: false,
    },
    qwen: {
      letter: 'F',
      text: 'The flame character turns from blue to red as it lets out a mischievous laugh, with the color shift and laugh together symbolizing its change from mellow to mischievous.',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `Gemini misses both modalities at once here: the colors are wrong and the laugh type is wrong. Qwen3-Omni aligns the auditory and visual transformation correctly, showing that the item is solvable but still nontrivial.`,
    reasoningExcerpt:
      `The flame character in the video is initially a glowing blue/cyan. At around the 0:54 mark, when it lets out a mischievous, cackling laugh, its color rapidly shifts to a fiery orange/red with some purple accents. This change from a calm blue to a more vibrant, energetic red/orange, combined with the mischievous laugh, symbolizes a shift in its deme`,
  },
  {
    id: 'C4',
    category: 'gemini_wrong',
    failureLabel: 'FABRICATED HUMAN BEHAVIOR',
    video: 'UK_cNOiiZts.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Needle', 'Referential Grounding', 'Comparative'],
    question:
      `Before the video game narrator says, "cause if you can get to that top plan form up smash air, up till you could take that stock very early," what does the player wearing a black shirt do when both players appear on the screen side by side with a white line dividing the screens into two?`,
    gt: {
      letter: 'D',
      text: 'He rubs his eyes, puts a fist over his mouth, and then adjusts his glasses.',
    },
    gemini: {
      letter: 'A',
      text: 'He smiles broadly, gives a thumbs-up toward the camera, and nods enthusiastically.',
      correct: false,
    },
    qwen: {
      letter: 'D',
      text: 'He rubs his eyes, puts a fist over his mouth, and then adjusts his glasses.',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `Gemini fabricates a completely different demeanor and gesture sequence, while Qwen3-Omni identifies the actual behavior. That reversal is useful evidence that the benchmark is not simply sorted by general model strength.`,
    reasoningExcerpt:
      `The video game narrator says the quote, "cause if you can get to that top plan form up smash air, up till you could take that stock very early," from timestamp **01:31:49** to **01:33:40**. During this time, the video shows both players actively engaged in the game, with their hands on controllers and eyes on their monitors. None of the options (A)`,
  },
  {
    id: 'C5',
    category: 'gemini_wrong',
    failureLabel: 'COUNTING: 3 vs 8 HAND RAISES',
    video: 'umgFAFe472A.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Needle', 'Referential Grounding', 'Counting'],
    question:
      `After the narrator asks, "did you think this was a bug in FIFA" how many times does the football player wearing the number three jersey raises his right hand in the air before walking towards the left side?`,
    gt: {
      letter: 'J',
      text: 'He raises his right hand in the air 3 times before walking toward the left side.',
    },
    gemini: {
      letter: 'E',
      text: 'He raises his right hand in the air 8 times before walking toward the left side.',
      correct: false,
    },
    qwen: {
      letter: 'J',
      text: 'He raises his right hand in the air 3 times before walking toward the left side.',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `Gemini overcounts by nearly a factor of three on a visually grounded question with a precise spoken anchor. Qwen3-Omni gets the count correct, reinforcing that the benchmark still exposes real brittleness in the top model.`,
    reasoningExcerpt:
      `To answer the question, we need to observe the football player wearing jersey number three and count how many times he raises his right hand in the air after the narrator asks "did you think this was a bug in FIFA" (at 0:31:30) and before he starts walking towards the left side (at approximately 0:31:42).

Let's count the distinct upward movements`,
  },
  {
    id: 'C6',
    category: 'gemini_wrong',
    failureLabel: 'COUNTING: 2 vs 7 PEOPLE WITH HEADGEAR',
    video: 'Gnr2k-VvsCc.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Context', 'Needle', 'Counting'],
    question:
      `After the speaker says, "I've come through this terminal 100 times in my life, I've never seen it this crowded" how many people are seen wearing head gear?`,
    gt: {
      letter: 'G',
      text: '2 people are seen wearing head gear.',
    },
    gemini: {
      letter: 'I',
      text: '7 people are seen wearing head gear.',
      correct: false,
    },
    qwen: {
      letter: 'G',
      text: '2 people are seen wearing head gear.',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `This is another severe counting miss from Gemini, with a 2-vs-7 error on a crowded scene. Qwen3-Omni's correct answer makes the point that the problem is not impossible, only still unresolved.`,
    reasoningExcerpt:
      `The speaker says, "I've come through this terminal 100 times in my life, I've never seen it this crowded" at timestamp 0:03:33.

Observing the scene immediately after this statement (from 0:03:38 onwards in the video), we can count the people wearing headgear:
1.  A man on the left moving walkway, wearing a dark fedora (0:03:38).
2.  Further down o`,
  },
  {
    id: 'C7',
    category: 'gemini_wrong',
    failureLabel: 'WRONG ANIMAL, WRONG ACTION',
    video: '-z9B0M-d-r0.mp4',
    skills: ['Inference', 'Context', 'Needle', 'Referential Grounding'],
    question: `In the clip where someone says, "Nice dance Ellie," what accompanying visual makes this funny?`,
    gt: {
      letter: 'H',
      text: 'A woman at the zoo presses her hands up and down on the glass, and a large gray furry animal copies her on the other side, so it looks like they are dancing together, which makes the clip funny.',
    },
    gemini: {
      letter: 'A',
      text: 'A leopard in a grassy enclosure stands upright on its hind legs and sways back and forth while a small dog watches from below, making the scene look like the leopard is dancing.',
      correct: false,
    },
    qwen: {
      letter: 'H',
      text: 'A woman at the zoo presses her hands up and down on the glass, and a large gray furry animal copies her on the other side, so it looks like they are dancing together, which makes the clip funny.',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `Gemini fabricates nearly every salient detail: the animal, the action, and the surrounding setup. Qwen3-Omni grounds the answer correctly, making this a strong counterexample to any claim that Gemini is effectively at ceiling.`,
    reasoningExcerpt:
      `The correct option is (A).

Here's why:
At timestamp 0:05:44, the video shows a leopard standing on its hind legs in a grassy enclosure. It moves its front paws and body in a way that resembles dancing or playfully batting at a small, light-colored object (which could be a toy or a small, very still animal) on the ground. The audio states, "Nice da`,
  },
  {
    id: 'C8',
    category: 'gemini_wrong',
    failureLabel: 'NARRATIVE PURPOSE OF MUSIC',
    video: 'j8PDTJNaPc0.mp4',
    skills: ['Inference', 'Context'],
    question: 'Why does the music cut out in the video?',
    gt: {
      letter: 'H',
      text: 'The music is used to build dramatic effect and cuts out when the frog lands on the lily pad because it believes it is safe, signaling that the dramatic chase has ended.',
    },
    gemini: {
      letter: 'C',
      text: 'The music cuts out when the frog lands on the large leaf outside, to highlight the quiet natural ambience of crickets and insects replacing the score.',
      correct: false,
    },
    qwen: {
      letter: 'H',
      text: 'The music is used to build dramatic effect and cuts out when the frog lands on the lily pad because it believes it is safe, signaling that the dramatic chase has ended.',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `Gemini notices the timing but misses the storytelling function of the music. Qwen3-Omni gets the higher-level narrative interpretation right, which is exactly the kind of holistic audio-visual understanding MMOU is intended to test.`,
    reasoningExcerpt:
      `The music in the video builds dramatic tension throughout the frog's escape from the girl.

1.  From 0:00 to approximately 1:16, tense, action-oriented music plays as the frog attempts to escape the girl.
2.  At 1:16, the frog lands safely on a lily pad in a peaceful forest pond.
3.  Immediately upon the frog landing and looking around, the dramati`,
  },
  {
    id: 'C9',
    category: 'gemini_wrong',
    failureLabel: 'AUDIO LIST COMPLETENESS',
    video: 'yQ6lxhmQa_k.mp4',
    skills: ['Needle', 'Referential Grounding'],
    question: 'What countries does the narrator list when a map of the world is shown on the screen?',
    gt: {
      letter: 'F',
      text: 'US, UK, Brazil, India, China, Malaysia, Mexico, Bangladesh, Egypt, Tunisia, Lebanon, and Kazakhstan',
    },
    gemini: {
      letter: 'A',
      text: 'US, UK, Brazil, India, China, Malaysia, Mexico, Bangladesh, Egypt, Tunisia, and Lebanon',
      correct: false,
    },
    qwen: {
      letter: 'F',
      text: 'US, UK, Brazil, India, China, Malaysia, Mexico, Bangladesh, Egypt, Tunisia, Lebanon, and Kazakhstan',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `Gemini misses a single listed country, Kazakhstan, while Qwen3-Omni captures the full audio list. That makes this a compact example of how incomplete listening can still sink otherwise plausible answers.`,
    reasoningExcerpt:
      `The narrator lists the following countries when the map of the world is shown:
- US
- UK
- Brazil
- India
- China
- Malaysia
- Mexico
- Bangladesh
- Egypt
- Tunisia
- Lebanon
- Kazakhstan

Comparing this list with the given options:
(A) US, UK, Brazil, India, China, Malaysia, Mexico, Bangladesh, Egypt, Tunisia, and Lebanon - Missing Kazakhstan.
(B)`,
  },
  {
    id: 'C10',
    category: 'gemini_wrong',
    failureLabel: 'VISUAL DETAIL PRECISION',
    video: '3RjEQrqbh6I.mp4',
    skills: ['Temporal Understanding', 'Sequential', 'Needle', 'Tacking Spurious Correlations'],
    question: `What happens right after the orange character says, "yeah, it goes limper than an animator's handshake,"`,
    gt: {
      letter: 'I',
      text: 'One of his legs is erased and he falls to the ground.',
    },
    gemini: {
      letter: 'D',
      text: 'His entire body glitches and disappears from the screen.',
      correct: false,
    },
    qwen: {
      letter: 'I',
      text: 'One of his legs is erased and he falls to the ground.',
      correct: true,
    },
    sameWrong: false,
    analysis:
      `Qwen3-Omni captures the specific visual detail that matters, while Gemini inflates the event into a much larger disappearance. This is another concrete case where the top model is close in spirit but wrong in the decisive detail.`,
    reasoningExcerpt:
      `The correct answer is **(D) His entire body glitches and disappears from the screen.**`,
  },
]
