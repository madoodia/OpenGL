float diff = (a - b) / k;
diff = saturate(0.5 * (diff + 1));
float blend = lerp(a, b, diff);
blend -= diff * (1 - diff) * k;

return blend;