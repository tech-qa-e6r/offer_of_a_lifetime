using System;
using UnityEngine;
using TMPro;

public class ResultPopup : MonoBehaviour
{
    public TextMeshProUGUI titleText;
    public TextMeshProUGUI bodyText;

    private Action _onClose;

    public void Show(string title, string body, Action onClose = null, bool? success = null)
    {
        titleText.text = title;
        bodyText.text = body;
        _onClose = onClose;
        if (success == null)
            titleText.color = new UnityEngine.Color(0.8863f, 0.9098f, 0.9412f);
        else if (success.Value)
            titleText.color = new UnityEngine.Color(0.2902f, 0.8706f, 0.502f);
        else
            titleText.color = new UnityEngine.Color(0.9725f, 0.4431f, 0.4431f);
        gameObject.SetActive(true);
    }

    public void OnCloseClicked()
    {
        gameObject.SetActive(false);
        _onClose?.Invoke();
        _onClose = null;
    }
}
