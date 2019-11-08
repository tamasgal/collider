// create an rgba string to be used in ctx.*
// r, g, b and a should be values in (0, 1)
// the offset is a number between 0 and 255 and defines the "pastelity"
function rgba(r, g, b, a, offset=100) {
    s = 255 - offset;
    r = offset + Math.round(r * s);
    g = offset + Math.round(g * s);
    b = offset + Math.round(b * s);
    console.log('rgba('+r+','+g+','+b+','+a+')');
    return 'rgba('+r+','+g+','+b+','+a+')';
}
