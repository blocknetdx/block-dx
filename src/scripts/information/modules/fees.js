const renderFees = () => {
  const html = `
    <div class="main-area">

      <div class="section intro">
        <p class="no-header">
          Using Block DX is cheaper than using centralized exchanges, especially since there are no withdrawal fees. Below is Block DX’s fee structure. For the most up-to-date information on fees, <a href="#" class="blocknet-link" data-link="https://docs.blocknet.co/blockdx/fees/">click here</a>.
        </p>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-header-text">Maker Fee</div><div class="section-header-line"></div>
        </div>
        <p>
          When creating an order on Block DX, there is no fee other than the network fee of the token being sold. This is the same type of fee you would incur if sending this token to another party.
        </p>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-header-text">Taker Fee</div><div class="section-header-line"></div>
        </div>
        <p>
          When accepting an order on Block DX, a static fee of 0.015 BLOCK is charged at the time the order is taken. This fee is charged even if a trade is canceled or fails and is meant to discourage malicious behavior on the network.
        </p>
        <p>  
          In addition to the 0.015 BLOCK fee, there is also the network fee of the token being sold. This is the same type of fee you would incur if sending this token to another party.
        </p>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-header-text">Fees Distribution</div><div class="section-header-line"></div>
        </div>
        <p>
          100% of trade fees are distributed to Blocknet Service Node operators for supporting the network.
        </p>
      </div>

    </div>
  `;

  return html;
};

module.exports = renderFees;