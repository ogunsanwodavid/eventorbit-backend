//Default checkout questions
const DEFAULT_CHECKOUT_QUESTIONS = [
  {
    per: "ticket",
    type: "shortText",
    required: true,
    labelTitle: "First Name",
    appliesTo: "all",
    isImmutable: true,
    isVisible: true,
  },
  {
    per: "ticket",
    type: "shortText",
    required: true,
    labelTitle: "Last Name",
    appliesTo: "all",
    isImmutable: true,
    isVisible: true,
  },
  {
    per: "ticket",
    type: "shortText",
    required: true,
    labelTitle: "Email",
    appliesTo: "all",
    isImmutable: true,
    isVisible: true,
  },
];

export default DEFAULT_CHECKOUT_QUESTIONS;
