import { Interface } from "@ethersproject/abi";
import { Transaction } from "@gnosis.pm/safe-apps-sdk";

import erc20Abi from "../abis/erc20";
import payrollAbi from "../abis/payroll";

import { getSablierAddress } from "../config/sablier";
import { SablierNetworks } from "../types";

const createStreamTxs = (
  network: SablierNetworks,
  recipient: string,
  deposit: string,
  tokenAddress: string,
  startTime: string,
  stopTime: string,
): Transaction[] => {
  const sablierProxyAddress: string = getSablierAddress(network);
  const erc20Interface: Interface = new Interface(erc20Abi);
  const sablierProxyInterface: Interface = new Interface(payrollAbi);

  const approvalTx = {
    data: erc20Interface.encodeFunctionData("approve", [sablierProxyAddress, deposit]),
    to: tokenAddress,
    value: "0",
  };

  const streamTx = {
    data: sablierProxyInterface.encodeFunctionData("createSalary", [
      recipient,
      deposit,
      tokenAddress,
      startTime,
      stopTime,
    ]),
    to: sablierProxyAddress,
    value: "0",
  };

  return [approvalTx, streamTx];
};

export default createStreamTxs;
