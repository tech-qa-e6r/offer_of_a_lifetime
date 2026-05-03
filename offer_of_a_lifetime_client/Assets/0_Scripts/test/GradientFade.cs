using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(RawImage))]
public class GradientFade : MonoBehaviour
{
    void Start()
    {
        const int h = 32;
        var tex = new Texture2D(1, h, TextureFormat.RGBA32, false);
        tex.wrapMode = TextureWrapMode.Clamp;
        tex.filterMode = FilterMode.Bilinear;
        // r=10 g=14 b=23 matches BG color {r:0.0392, g:0.0549, b:0.0902}
        for (int y = 0; y < h; y++)
        {
            float t = y / (float)(h - 1); // 0=bottom(opaque), 1=top(transparent)
            tex.SetPixel(0, y, new Color32(10, 14, 23, (byte)(255 * (1f - t))));
        }
        tex.Apply();

        var img = GetComponent<RawImage>();
        img.texture = tex;
        img.color = Color.white;
        img.raycastTarget = false;
    }
}
