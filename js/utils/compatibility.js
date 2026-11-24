/**
 * GAMEVAULT - PC Compatibility Engine
 * Validates hardware combinations in the PC Builder:
 * - CPU Socket vs Motherboard Socket
 * - Motherboard RAM Generation vs Selected RAM
 * - System Total Wattage vs PSU Output
 */

const CompatibilityEngine = {
  validateBuild(builderState) {
    const issues = [];
    const warnings = [];

    // Retrieve full product objects for selected slots
    const cpu = builderState.cpu ? getProductById(builderState.cpu) : null;
    const mb = builderState.motherboard ? getProductById(builderState.motherboard) : null;
    const ram = builderState.ram ? getProductById(builderState.ram) : null;
    const gpu = builderState.gpu ? getProductById(builderState.gpu) : null;
    const psu = builderState.psu ? getProductById(builderState.psu) : null;

    // 1. Check CPU vs Motherboard Socket
    if (cpu && mb) {
      const cpuSocket = cpu.specs?.socket;
      const mbSocket = mb.specs?.socket;
      if (cpuSocket && mbSocket && cpuSocket.toUpperCase() !== mbSocket.toUpperCase()) {
        issues.push({
          type: 'SOCKET_INCOMPATIBLE',
          title: 'Socket Mismatch',
          message: `Incompatible Socket: CPU (${cpu.name}) requires ${cpuSocket}, but Motherboard (${mb.name}) has socket ${mbSocket}.`
        });
      }
    }

    // 2. Check Motherboard RAM generation vs RAM Module
    if (mb && ram) {
      const mbRamSupport = mb.specs?.ramSupport || '';
      const ramType = ram.specs?.type || '';
      if (mbRamSupport && ramType && !mbRamSupport.toUpperCase().includes(ramType.toUpperCase())) {
        issues.push({
          type: 'RAM_INCOMPATIBLE',
          title: 'RAM Type Mismatch',
          message: `Incompatible Memory: Motherboard supports ${mbRamSupport}, but selected RAM is ${ramType}.`
        });
      }
    }

    // 3. Wattage Calculation
    const totalWattage = this.calculateTotalWattage(builderState);
    const recommendedWattage = Math.round(totalWattage * 1.25); // 25% safety headroom

    // 4. Check PSU Capacity
    if (psu) {
      const psuCapacity = psu.wattage || 0;
      if (psuCapacity < totalWattage) {
        issues.push({
          type: 'PSU_INSUFFICIENT',
          title: 'Insufficient Power Supply',
          message: `Critical: Your build requires approximately ${totalWattage}W, but your selected PSU (${psu.name}) is only rated for ${psuCapacity}W.`
        });
      } else if (psuCapacity < recommendedWattage) {
        warnings.push({
          type: 'PSU_HEADROOM_LOW',
          title: 'Low Power Headroom',
          message: `Recommended PSU capacity is ${recommendedWattage}W (includes 25% transient peak safety headroom). Current PSU is ${psuCapacity}W.`
        });
      }
    }

    return {
      isCompatible: issues.length === 0,
      issues,
      warnings,
      totalWattage,
      recommendedWattage
    };
  },

  calculateTotalWattage(builderState) {
    let wattage = 50; // Base baseline motherboard, fans & chipset power

    const slots = ['cpu', 'gpu', 'ram', 'storage', 'cooler'];
    slots.forEach(slot => {
      const productId = builderState[slot];
      if (productId) {
        const prod = getProductById(productId);
        if (prod && typeof prod.wattage === 'number') {
          wattage += prod.wattage;
        }
      }
    });

    return wattage;
  }
};
