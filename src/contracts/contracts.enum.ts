import { ContractType } from './contract-type.enum';

export const Contracts = {
  [ContractType.TUTOR]: {
    name: ContractType.TUTOR,
    price: 10000,
  },

  [ContractType.UNLIMITED]: {
    name: ContractType.UNLIMITED,
    price: 15000,
  },

  [ContractType.LIMITED]: {
    name: ContractType.LIMITED,
    price: 5000,
  },
};
