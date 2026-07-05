import { MockDocument } from './types';

export const mockDocuments: MockDocument[] = [
  {
    id: 'ai-ethics',
    title: 'Lecture Notes: AI Alignment and Hallucination Mitigation',
    description: 'Academic overview of Large Language Model alignment techniques and strict context bounding strategies.',
    fileName: 'AI_Ethics_Lecture_Notes.pdf',
    fileSize: '1.2 MB',
    paragraphs: [
      {
        id: 'P1',
        text: 'Large Language Models (LLMs) are trained on massive corpuses of web text, allowing them to excel at language generation but also predisposing them to "knowledge hallucinations." A hallucination occurs when the model generates highly plausible-sounding statements that are factually incorrect or unsupported by the training data or prompt context. In high-stakes settings like medicine, law, or academic assessment, these fabrications render standard LLMs unreliable without strict intervention.'
      },
      {
        id: 'P2',
        text: 'To resolve this, modern cognitive architectures employ a design pattern known as Strict Context-Bounding. Unlike standard Retrieval-Augmented Generation (RAG) which retrieves external documents but still allows the LLM to write answers from memory, Strict Context-Bounding locks the model\'s attention. The system provides a prompt that forbids the usage of any external internet data or pre-trained knowledge, instructing the model to generate output strictly and explicitly from the provided text segments.'
      },
      {
        id: 'P3',
        text: 'Verification of context-bounding is performed at two distinct stages: Generation Audit and Post-Processing. During the Generation Audit, token probability weights are restricted and custom temperature values (usually near 0.0) are enforced to limit creativity. In Post-Processing, semantic parsing tools compare generated entities and factual claims against the original source paragraph tokens, flagging any discrepancy as an out-of-bounds (OOB) event.'
      },
      {
        id: 'P4',
        text: 'The value proposition of applying this architecture to assessment generation is significant. Educators can reduce their test preparation workloads by up to 70% while maintaining absolute confidence in curriculum alignment. Furthermore, students receive revision questions that are guaranteed to correspond to their assigned reading materials, accompanied by paragraph-level citations (e.g., [P1], [P2]) that map answers directly back to their source texts.'
      }
    ],
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        questionText: 'What is a "knowledge hallucination" in the context of Large Language Models?',
        options: [
          'A hardware failure caused by intensive model training parameters',
          'An event where the model generates plausible-sounding but factually unsupported statements',
          'A user interface error displaying text in the wrong font or layout',
          'An optimized state where the model processes language 70% faster than usual'
        ],
        correctAnswer: 'An event where the model generates plausible-sounding but factually unsupported statements',
        citation: 'P1',
        explanation: 'Paragraph [P1] explicitly defines a hallucination as when "the model generates highly plausible-sounding statements that are factually incorrect or unsupported by the training data or prompt context."',
        curriculumAligned: true
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        questionText: 'How does Strict Context-Bounding differ from standard Retrieval-Augmented Generation (RAG)?',
        options: [
          'It is designed solely for hardware accelerators like GPUs and TPUs',
          'It does not require any source text or document uploads to function',
          'It locks the model\'s attention, forbidding any usage of external internet data or pre-trained memory',
          'It permits unlimited creativity to ensure tests are engaging and fun'
        ],
        correctAnswer: 'It locks the model\'s attention, forbidding any usage of external internet data or pre-trained memory',
        citation: 'P2',
        explanation: 'Paragraph [P2] notes that unlike standard RAG which allows the LLM to write from pre-trained memory, Strict Context-Bounding "locks the model\'s attention... forbidding the usage of any external internet data or pre-trained knowledge."',
        curriculumAligned: true
      },
      {
        id: 'q3',
        type: 'fill-in-the-blank',
        questionText: 'During the Generation Audit stage of context verification, custom temperature values are set near ________ to limit model creativity.',
        correctAnswer: '0.0',
        citation: 'P3',
        explanation: 'Paragraph [P3] details that during Generation Audit, "custom temperature values (usually near 0.0) are enforced to limit creativity."',
        curriculumAligned: true
      },
      {
        id: 'q4',
        type: 'short-answer',
        questionText: 'What are the two stages at which context-bounding is verified in the SEGS architecture?',
        correctAnswer: 'Generation Audit and Post-Processing',
        citation: 'P3',
        explanation: 'Paragraph [P3] states: "Verification of context-bounding is performed at two distinct stages: Generation Audit and Post-Processing."',
        curriculumAligned: true
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        questionText: 'According to the text, by what maximum percentage can educators reduce their test preparation workloads using SEGS?',
        options: [
          '35%',
          '50%',
          '70%',
          '95%'
        ],
        correctAnswer: '70%',
        citation: 'P4',
        explanation: 'Paragraph [P4] mentions: "Educators can reduce their test preparation workloads by up to 70% while maintaining absolute confidence in curriculum alignment."',
        curriculumAligned: true
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        questionText: 'Which company launched the GPT-4o model, and on what exact date was it made available to the public?',
        options: [
          'OpenAI on May 13, 2024',
          'Google on May 14, 2024',
          'Meta on April 18, 2024',
          'Anthropic on June 20, 2024'
        ],
        correctAnswer: 'OpenAI on May 13, 2024',
        citation: 'P1',
        explanation: 'WARNING: This question was generated using general pre-trained knowledge. It references external release dates not found anywhere in the provided document, violating strict context-bounding limits.',
        outOfBounds: true,
        curriculumAligned: false
      }
    ]
  },
  {
    id: 'photosynthesis',
    title: 'Textbook Extract: Chapter 4 - Light Reactions & Calvin Cycle',
    description: 'Detailed study passage on chloroplast mechanics, electron transport chains, and carbon fixation pathways.',
    fileName: 'Photosynthesis_Textbook_Ch4.docx',
    fileSize: '850 KB',
    paragraphs: [
      {
        id: 'P1',
        text: 'Photosynthesis is the metabolic pathway through which photoautotrophs convert light energy into chemical energy, primarily in the form of glucose. In eukaryotic cells, this complex process takes place inside double-membraned organelles called chloroplasts. The interior of the chloroplast contains disk-like sacs called thylakoids, stacked into column structures known as grana, suspended in a dense fluid interface called the stroma.'
      },
      {
        id: 'P2',
        text: 'The process is divided into two operational phases: the light-dependent reactions and the light-independent reactions (also referred to as the Calvin Cycle). The light-dependent reactions occur exclusively in the thylakoid membranes, where photosystem II (PSII) and photosystem I (PSI) capture photons. This absorbed energy drives an electron transport chain, splitting water molecules (photolysis) to release oxygen gas and synthesizing ATP and NADPH molecules.'
      },
      {
        id: 'P3',
        text: 'The Calvin Cycle operates within the chloroplast stroma and does not directly require light. Instead, it utilizes the ATP and NADPH generated by the light reactions to convert carbon dioxide (CO2) into three-carbon sugars (glyceraldehyde 3-phosphate, or G3P). The key enzyme catalyzing the initial step of this carbon fixation pathway is Ribulose-1,5-bisphosphate carboxylase-oxygenase, commonly abbreviated as Rubisco.'
      },
      {
        id: 'P4',
        text: 'Rubisco is widely considered the most abundant protein on Earth, though it is highly inefficient compared to other enzymes. It is susceptible to photorespiration, a wasteful side-reaction where Rubisco binds oxygen instead of carbon dioxide, reducing net carbon fixation efficiency by up to 25% under hot, dry atmospheric conditions.'
      }
    ],
    questions: [
      {
        id: 'pq1',
        type: 'multiple-choice',
        questionText: 'Where do the light-dependent reactions of photosynthesis take place in eukaryotic cells?',
        options: [
          'Within the dense fluid stroma of the chloroplast',
          'Directly inside the cell cytoplasm matrix',
          'Across the thylakoid membranes inside chloroplasts',
          'Within the intermembrane spaces of mitochondria'
        ],
        correctAnswer: 'Across the thylakoid membranes inside chloroplasts',
        citation: 'P2',
        explanation: 'Paragraph [P2] explicitly states that: "The light-dependent reactions occur exclusively in the thylakoid membranes..."',
        curriculumAligned: true
      },
      {
        id: 'pq2',
        type: 'multiple-choice',
        questionText: 'Which enzyme is responsible for catalyzing the first step of carbon fixation in the Calvin Cycle?',
        options: [
          'ATP Synthase',
          'Rubisco (Ribulose-1,5-bisphosphate carboxylase-oxygenase)',
          'Pep Carboxylase',
          'Hexokinase'
        ],
        correctAnswer: 'Rubisco (Ribulose-1,5-bisphosphate carboxylase-oxygenase)',
        citation: 'P3',
        explanation: 'Paragraph [P3] states that: "The key enzyme catalyzing the initial step of this carbon fixation pathway is Ribulose-1,5-bisphosphate carboxylase-oxygenase, commonly abbreviated as Rubisco."',
        curriculumAligned: true
      },
      {
        id: 'pq3',
        type: 'fill-in-the-blank',
        questionText: 'The process of splitting water molecules in the thylakoid membrane is known as ________.',
        correctAnswer: 'photolysis',
        citation: 'P2',
        explanation: 'Paragraph [P2] states that the light reactions absorb energy which "drives an electron transport chain, splitting water molecules (photolysis) to release oxygen gas..."',
        curriculumAligned: true
      },
      {
        id: 'pq4',
        type: 'short-answer',
        questionText: 'What is photorespiration and by what percentage can it reduce carbon fixation efficiency under dry conditions?',
        correctAnswer: 'A wasteful side-reaction where Rubisco binds oxygen instead of CO2, reducing efficiency by up to 25%',
        citation: 'P4',
        explanation: 'Paragraph [P4] notes that photorespiration is "a wasteful side-reaction where Rubisco binds oxygen instead of carbon dioxide, reducing net carbon fixation efficiency by up to 25% under hot, dry atmospheric conditions."',
        curriculumAligned: true
      },
      {
        id: 'pq5',
        type: 'multiple-choice',
        questionText: 'Which specific organelles within plant cells are responsible for carrying out photosynthesis?',
        options: [
          'Mitochondria',
          'Lysosomes',
          'Chloroplasts',
          'Endoplasmic Reticulum'
        ],
        correctAnswer: 'Chloroplasts',
        citation: 'P1',
        explanation: 'Paragraph [P1] notes that in eukaryotic cells, photosynthesis "takes place inside double-membraned organelles called chloroplasts."',
        curriculumAligned: true
      },
      {
        id: 'pq6',
        type: 'multiple-choice',
        questionText: 'How many ATP molecules in total are consumed during one full turn of the Krebs Cycle in human liver cells?',
        options: [
          '2 ATP molecules',
          '36 ATP molecules',
          'Zero ATP (it generates GTP/ATP instead of consuming them)',
          '18 ATP molecules'
        ],
        correctAnswer: 'Zero ATP (it generates GTP/ATP instead of consuming them)',
        citation: 'P3',
        explanation: 'WARNING: This question references cellular respiration (Krebs Cycle in human cells), which is completely out-of-scope for the provided photosynthesis text. This is a severe hallucination.',
        outOfBounds: true,
        curriculumAligned: false
      }
    ]
  }
];
