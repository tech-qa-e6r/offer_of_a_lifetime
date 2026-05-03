using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class SetupCardSlot : MonoBehaviour
{
    [Header("Настройки слота")]
    public SetupCategory category; // Какую категорию тянет этот слот

    [Header("UI Элементы")]
    public GameObject cardBack;
    public TextMeshProUGUI titleText;
    public TextMeshProUGUI descriptionText;
    public GameObject gradientStrip;

    private bool isRevealed = false;

    void Start()
    {
        titleText.gameObject.SetActive(false);
        descriptionText.gameObject.SetActive(false);
    }

    public void OnSlotClicked()
    {
        if (isRevealed) return;
        GameManager.Instance.DrawSetupCard(this);
    }

    public void RevealCard(SetupCardData data)
    {
        titleText.gameObject.SetActive(true);
        descriptionText.gameObject.SetActive(true);
        titleText.text = data.cardName;
        descriptionText.text = data.backgroundStory;
        cardBack.SetActive(false);
        if (gradientStrip != null) gradientStrip.SetActive(true);
        isRevealed = true;
    }

    public void MakeMiniCard()
    {
        if (descriptionText != null) descriptionText.gameObject.SetActive(false);
    }
}