const renderBlocknet = () => {
  const html = `
    <div class="main-area">
      <div class="section intro">
        <div class="section-header">
          <div class="section-header-text">Block DX is powered by the Blocknet Protocol</div>
        </div>
        <p>
          In addition to the information below, you can learn more about Blocknet <a href="#" class="blocknet-link" data-link="https://docs.blocknet.co/">here</a>.
        </p>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-header-text">What is Blocknet?</div><div class="section-header-line"></div>
        </div>
        <p>
          Blocknet is a 2nd layer blockchain interoperability protocol that enables communication, interaction, and exchange between different blockchains. This allows for the development of multi-chain applications and blockchain microservices, creating exponentially more capabilities and possibilities for the blockchain ecosystem. Blocknet is a self-funded and self-governed open source project with contributors around the world building an open and collaborative ecosystem.
        </p>
        <p>
          Subscribe to the following email lists for the latest features, updates, and news!
          <ul>
            <li><a href="#" class="blocknet-link" data-link="http://eepurl.com/c5OJMj">General Newsletter</a></li>
            <li><a href="#" class="blocknet-link" data-link="http://eepurl.com/dq-ElD">Service Node Newsletter</a></li>
            <li><a href="#" class="blocknet-link" data-link="http://eepurl.com/dDjhYH">Developer Newsletter</a></li>
          </ul>
        </p>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-header-text">Technical Overview</div><div class="section-header-line"></div>
        </div>
        <p>
          Blocknet is a Proof-of-Stake (PoS) blockchain with a utility token called <a href="#" class="blocknet-link" data-link="https://docs.blocknet.co/blockchain/introduction">BLOCK</a>. Unlike other currency-focused blockchains, Blocknet is a service-based blockchain comprised of 3 main components:
        </p>
        <p>
          <ul>
            <li>
              <strong>XRouter</strong> - Provides the Blocknet Protocol with a communication layer consisting of an inter-blockchain SPV backend that enables the verification of blockchain records without requiring users to download the full blockchain. XRouter allows applications to interface with blockchains on the TCP/IP networking layer, enabling a true Internet of Blockchains.
            </li>
            <li>
              <strong>XBridge</strong> - Provides the ability to perform trustless atomic swap exchanges between any blockchain that is supported by the Blocknet Protocol via APIs. XBridge allows any application to perform decentralized exchange, opening the door to an ecosystem of decentralized trading services.
            </li>
            <li>
              <strong>XCloud</strong> - Provides a decentralized microservice cloud network powered by XRouter. Developers will be able to put both blockchain and non-blockchain microservices on Blocknet’s “public cloud” decentralized network. XCloud allows applications to run entirely decentralized, opening the door to the possibility of monetizable, fully decentralized applications.
            </li>
          </ul>
        </p>
        <p>
          The Blocknet Protocol is designed to maximize interoperability between different blockchains through the use of these components. Just as the internet enabled computers to communicate, the Blocknet Protocol is critical for blockchains to realize full potential.
        </p>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-header-text">Nodes</div><div class="section-header-line"></div>
        </div>
        <p>
          The network is powered by 2 types of nodes:
        </p>
        <p>
          <li>
            <strong>Staking Nodes</strong> - Secures the network by staking BLOCK to verify the blockchain. This service earns 30% of block rewards.
          </li>
          <li>
            <strong>Service Nodes</strong> - Hosts the full nodes of compatible blockchains, hosts microservices, audits interactions, and performs anti-spam and anti-DOS measures for the network. This service earns 70% of block rewards and 100% of fees generated from use of the network's services.
          </li>
        </p>
        <p>
          The following are the requirements to operate each type of node:
        </p>
        <p>
          <li>
            <strong>Staking Nodes</strong> - A Staking Node can be operated with any amount of BLOCK, but staking more BLOCK yields more frequent rewards.
          </li>
          <li>
            <strong>Service Nodes</strong> - A Service Node requires 5000 BLOCK.
          </li>
        </p>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-header-text">Tokenomics</div><div class="section-header-line"></div>
        </div>
        <p>
          <a href="#" class="blocknet-link" data-link="https://docs.blocknet.co/blockchain/introduction">BLOCK</a> is the utility token that powers the Blocknet. Fees are paid in BLOCK when using the network and 100% of those fees are distributed to Service Nodes for supporting the network and infrastructure. Normal transaction fees on the network are also paid in BLOCK, but those fees are burned. If seeking to acquire BLOCK, <a href="#" class="blocknet-link" data-link="https://docs.blocknet.co/project/exchanges">there are various options available</a>.
        </p>
        <p>
          Blocknet involves multiple economic models with respect to the use of the BLOCK token:
        </p>
        <p>
          <li>
            <strong>Block Rewards</strong> - Blocknet is Proof-of-Stake(PoS) with 1 BLOCK created every minute, of which 30% is awarded to Staking Nodes and 70% to Service Nodes.
          </li>
          <li>
            <strong>Service Fees</strong> - Service Nodes receive 100% of BLOCK fees generated from the use of services on the network, including trades performed via XBridge, interfacing with blockchains via XRouter, and use of microservices via XCloud.
          </li>
          <li>
            <strong>Collateral</strong> - BLOCK is required for collateral to operate a Service Node, as well as to use certain services on the network.
          </li>
          <li>
            <strong>Governance</strong> - Submitting proposals to the network requires a fee to be paid in BLOCK and proposals can only be voted on by Service Nodes.
          </li>
          <li>
            <strong>Transaction Fees</strong> - Transferring funds on the network incurs a transaction fee paid in BLOCK.
          </li>
        </p>
        <p>
          The utility of the BLOCK token increases the buy pressure on the market, while the reward potential of operating a node reduces sell pressure on the market.
        </p>
      </div>

    </div>
  `;

  return html;
};

module.exports = renderBlocknet;