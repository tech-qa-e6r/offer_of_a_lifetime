using System;
using UnityEngine;
using TMPro;

public class ResultPopup : MonoBehaviour
{
    public TextMeshProUGUI titleText;
    public TextMeshProUGUI bodyText;

    private Action _onClose;

    public void Show(string title, string body, Action onClose = null)
    {
        titleText.text = title;
        bodyText.text = body;
        _onClose = onClose;
        gameObject.SetActive(true);
    }

    public void OnCloseClicked()
    {
        gameObject.SetActive(false);
        _onClose?.Invoke();
        _onClose = null;
    }
}
