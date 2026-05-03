using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(RawImage))]
public class BackgroundGrid : MonoBehaviour
{
    void Start()
    {
        const int cell = 48;
        var tex = new Texture2D(cell, cell, TextureFormat.RGBA32, false);
        tex.wrapMode = TextureWrapMode.Repeat;
        tex.filterMode = FilterMode.Point;
        var pixels = new Color32[cell * cell];
        var line = new Color32(99, 140, 255, 10);
        for (int y = 0; y < cell; y++)
            for (int x = 0; x < cell; x++)
                pixels[y * cell + x] = (x == 0 || y == 0) ? line : new Color32(0, 0, 0, 0);
        tex.SetPixels32(pixels);
        tex.Apply();

        var img = GetComponent<RawImage>();
        img.texture = tex;
        img.uvRect = new Rect(0, 0, 1920f / cell, 1080f / cell);
        img.color = Color.white;
        img.raycastTarget = false;
    }
}
