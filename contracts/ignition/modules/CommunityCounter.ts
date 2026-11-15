import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CommunityCounterModule", (m) => {
    const leader =  m.getParameter("leader", m.getAccount(0));
    const communityCounter = m.contract("CommunityCounter", [leader])

    return { communityCounter };
});