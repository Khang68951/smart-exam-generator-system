// SEGS State Management

export let appState = {
  activeRole: 'student', // 'student' | 'educator'
  activeFile: null,      // { name, size, text }
  pastedText: '',
  difficulty: 'easy',    // 'easy' | 'medium' | 'hard'
  questionCount: 5,
  questionTypes: {
    mc: true,
    fitb: true,
    sa: true
  },
  currentExam: null,
  studentAnswers: {},    // questionId -> studentAnswer
  examGraded: false
};

// Raw Document Templates for dynamic question generation
export const QUANTUM_DEMO_TEXT = `Wave-particle duality is the concept in quantum mechanics that every particle or quantum entity may be described as either a particle or a wave. It expresses the inability of the classical concepts 'particle' or 'wave' to fully describe the behavior of quantum-scale objects. As Albert Einstein wrote: 'It seems as though we must use sometimes the one theory and sometimes the other, while at times we may use either.'

The Schrödinger equation is a linear partial differential equation that governs the wave function of a quantum-mechanical system. Named after Erwin Schrödinger, who postulated the equation in late 1925 and published it in 1976, its discovery was a significant landmark in the development of quantum theory. The equation describes the wave function, which contains complete statistical information about the state of a system.

The Heisenberg uncertainty principle states that there is a fundamental limit to the precision with which certain pairs of physical properties of a particle, known as complementary variables, such as position (x) and momentum (p), can be known. Introduced by German physicist Werner Heisenberg in 1927, it states that the more precisely the position of some particle is determined, the less precisely its momentum can be known from initial conditions.

Quantum tunneling is a quantum mechanical phenomenon where a subatomic particle passes through a potential energy barrier that is taller than the kinetic energy of the particle. In classical mechanics, a particle would be reflected back if it does not possess sufficient energy. However, in quantum mechanics, particles exhibit wave-like behavior, allowing their wave function to leak through the barrier with a finite probability.

Superposition is a principle of quantum mechanics that states that a physical system—such as an electron—exists partly in all its theoretically possible states simultaneously. When measured, however, it gives a result corresponding to only one of the possible configurations, as described by the rules of quantum measurement. This concept is famously illustrated by the Schrödinger's Cat thought experiment.`;

export const HISTORY_DEMO_TEXT = `The Stamp Act of 1765 was the first direct tax imposed by the British Parliament on the American colonies. It required that many printed materials in the colonies be produced on stamped paper produced in London, carrying an embossed revenue stamp. The tax met with great resistance, sparking the colonial rallying cry 'No taxation without representation' and uniting diverse political groups against Parliament's reach.

The Boston Tea Party was a political protest that occurred on December 16, 1773, at Griffin's Wharf in Boston, Massachusetts. American colonists, frustrated and angry at Britain for imposing 'taxation without representation,' dumped 342 chests of tea, imported by the British East India Company, into the harbor. The event was a key escalation that led directly to the Coercive Acts of 1774, known in America as the Intolerable Acts.

The Battles of Lexington and Concord, fought on April 19, 1775, kicked off the American Revolutionary War. Tensions had been building for years between residents of the 13 American colonies and the British authorities, particularly in Massachusetts. On the night of April 18, 1775, hundreds of British troops marched from Boston to nearby Concord in order to seize an arms cache. Paul Revere and other riders sounded the alarm, and colonial militiamen mobilized to intercept the Redcoat column.

The Declaration of Independence, adopted by the Second Continental Congress on July 4, 1776, announced that the thirteen American colonies, then at war with Great Britain, would regard themselves as thirteen independent sovereign states, no longer under British rule. Written primarily by Thomas Jefferson, the declaration explained the philosophical justifications for independence, cataloged colonial grievances, and declared the birth of a new nation.

The Treaty of Paris, signed in Paris by representatives of King George III of Great Britain and representatives of the United States of America on September 3, 1783, officially ended the American Revolutionary War. The treaty recognized American independence, established borders for the new nation, and secured fishing rights for Americans off the coast of Canada, while promising fair treatment of loyalists who chose to remain.`;
