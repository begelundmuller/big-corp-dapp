pragma solidity ^0.4.2;

contract BigCorp {

  // Total number of shares in existance
  uint public totalShares;

  // Gives the number of shares owned by a given account
  mapping (address => uint) sharesOwned;

  // Event indicating that some shares were transferred
  event Transfer(address indexed from, address indexed to, uint amount);

  // Constructor
  function BigCorp(uint initialShares) {
    // Creator receives all initial shares
    sharesOwned[msg.sender] = initialShares;

    // Update totalShares
    totalShares = initialShares;
  }

  // Functions for ERC20 compliance
  // ----------------------------------------------------------------

  function totalSupply()
  constant returns (uint totalSupply) {
    return totalShares;
  }

  function balanceOf(address owner)
  constant returns (uint balance) {
    return sharesOwned[owner];
  }

  function transfer(address to, uint amount)
  returns (bool success) {
    // Amount must not be zero
    require(amount > 0);

    // Sender must have sufficient funds
    require(sharesOwned[msg.sender] >= amount);

    // The transfer must not cause an overflow (unlikely)
    require(sharesOwned[to] + amount > sharesOwned[to]);

    // Perform transfer
    sharesOwned[msg.sender] -= amount;
    sharesOwned[to]         += amount;

    // A transfer can change support for a president; this function makes
    // the appropriate corrections
    adjustVotesAfterTransfer(msg.sender, to, amount);

    // Log transfer event (this doesn't change the state of the block-
    // chain, but notifies watching clients that a change occured)
    Transfer(msg.sender, to, amount);

    // Indicate success
    return true;
  }

  // Note that ERC20 defines a couple more functions that we do not implement
  // See: https://github.com/ethereum/EIPs/issues/20

  // Variables and functions for voting on a president
  // ----------------------------------------------------------------

  // Account elected by shareholders to lead
  address public president;

  // Tracks the president candidate backed by a given account
  mapping (address => address) public candidateSupportedBy;

  // Gives the number of shares currently backing a given account for president.
  mapping (address => uint) public sharesVotingFor;

  // Event indicating that the president may have changed.
  event PresidentChanged();

  // Public function used by shareholders to back an account for president
  function voteForPresident(address candidate) {
    // If sender currently backs a candidate, unback
    if (candidateSupportedBy[msg.sender] > 0) {
      decreaseSupport(candidateSupportedBy[msg.sender], sharesOwned[msg.sender]);
    }

    // Back new candidate
    candidateSupportedBy[msg.sender] = candidate;
    increaseSupport(candidate, sharesOwned[msg.sender]);

    // Emit event
    PresidentChanged();
  }

  // Helper functions for voting
  // ----------------------------------------------------------------

  // Invariant 1
  //   (president == 0) OR (sharesVotingFor[president] > (totalShares / 2))
  //
  // Invariant 2
  //   sharesVotingFor[a] = sum(sharesOwned[b] forall b where candidateSupportedBy[b] == a)

  function increaseSupport(address candidate, uint shares) internal {
    // Ignore if shares == 0
    if (shares == 0) {
      return;
    }

    // Abort entire transaction if backing results in an overflow
    require(sharesVotingFor[candidate] + shares > sharesVotingFor[candidate]);

    // Increase backing shares for candidate
    sharesVotingFor[candidate] += shares;

    // If candidate has confidence of a majority, set as president
    if ((candidate != president)
          && (sharesVotingFor[candidate] > totalShares / 2)) {
      president = candidate;
    }
  }

  function decreaseSupport(address candidate, uint shares) internal {
    // Reduce number of shares backing candidate
    sharesVotingFor[candidate] -= shares;

    // If candidate is president and has lost majority confidence, remove
    if ((candidate == president)
          && (sharesVotingFor[candidate] <= totalShares / 2)) {
      president = address(0);
    }
  }

  function adjustVotesAfterTransfer(address from, address to, uint amount) internal {
    // If the sender backs a candidate,
    if (candidateSupportedBy[from] > 0) {
      decreaseSupport(candidateSupportedBy[from], amount);
    }

    if (candidateSupportedBy[to] > 0) {
      increaseSupport(candidateSupportedBy[to], amount);
    }

    // Emit event
    PresidentChanged();
  }

}
