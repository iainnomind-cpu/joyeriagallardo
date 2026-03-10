import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CartItem } from '../types';

export function useWholesaleConfig(cart: CartItem[] = []) {
    const [wholesaleConfig, setWholesaleConfig] = useState({
        condition_type: 'amount',
        threshold: 3000,
        enable_extra_discount: false,
        extra_discount_threshold: 5000,
        extra_discount_percentage: 10
    });

    useEffect(() => {
        const loadBusinessRules = async () => {
            const { data } = await supabase
                .from('business_rules')
                .select('*')
                .eq('rule_key', 'wholesale_threshold')
                .eq('is_active', true)
                .maybeSingle();

            if (data && data.rule_value) {
                setWholesaleConfig({
                    condition_type: data.rule_value.condition_type || 'amount',
                    threshold: data.rule_value.threshold !== undefined ? data.rule_value.threshold : (data.rule_value.amount || 3000),
                    enable_extra_discount: data.rule_value.enable_extra_discount || false,
                    extra_discount_threshold: data.rule_value.extra_discount_threshold || 5000,
                    extra_discount_percentage: data.rule_value.extra_discount_percentage || 10
                });
            }
        };

        loadBusinessRules();
    }, []);

    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const retailSubtotal = cart.reduce((sum, item) => sum + (item.retail_price * item.cantidad), 0);

    const isWholesale = wholesaleConfig.condition_type === 'pieces'
        ? totalItems >= wholesaleConfig.threshold
        : retailSubtotal >= wholesaleConfig.threshold;

    const subtotalCalc = cart.reduce((sum, item) => {
        const price = isWholesale ? (item.wholesale_price || item.retail_price) : item.retail_price;
        return sum + (price * item.cantidad);
    }, 0);

    let extraDiscountAmount = 0;
    if (isWholesale && wholesaleConfig.enable_extra_discount) {
        const meetsExtra = wholesaleConfig.condition_type === 'pieces'
            ? totalItems >= wholesaleConfig.extra_discount_threshold
            : subtotalCalc >= wholesaleConfig.extra_discount_threshold;

        if (meetsExtra) {
            extraDiscountAmount = subtotalCalc * (wholesaleConfig.extra_discount_percentage / 100);
        }
    }

    const total = subtotalCalc - extraDiscountAmount;

    return {
        wholesaleConfig,
        subtotal: retailSubtotal,
        subtotalCalc,
        extraDiscountAmount,
        total,
        isWholesale
    };
}
